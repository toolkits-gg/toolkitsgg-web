/**
 * Parser for wiki.gg `Module:*` raw output with the shape:
 *   return {
 *     ["Key Name"] = {
 *       Field = "value",
 *       AnotherField = "value with $tokens and {{templates}}",
 *       NumField = 12,
 *     },
 *   }
 *
 * Also tolerates modules that wrap the data in a `local <name> = { ... }`
 */

type LuaValue = string | number | boolean | null | LuaTable;
type LuaTable = { [key: string]: LuaValue };

type Token =
	| { type: "{" | "}" | "[" | "]" | "=" | "," }
	| { type: "string"; value: string }
	| { type: "number"; value: number }
	| { type: "ident"; value: string };

const tokenize = (input: string): Token[] => {
	const tokens: Token[] = [];
	let i = 0;
	const len = input.length;

	const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
	const isIdentCont = (c: string) => /[A-Za-z0-9_]/.test(c);
	const isDigit = (c: string) => c >= "0" && c <= "9";

	while (i < len) {
		const c = input[i]!;

		// whitespace
		if (c === " " || c === "\t" || c === "\n" || c === "\r") {
			i++;
			continue;
		}

		// line comment: -- ... \n
		if (c === "-" && input[i + 1] === "-") {
			while (i < len && input[i] !== "\n") i++;
			continue;
		}

		// punctuation
		if (
			c === "{" ||
			c === "}" ||
			c === "[" ||
			c === "]" ||
			c === "=" ||
			c === ","
		) {
			tokens.push({ type: c });
			i++;
			continue;
		}

		// string literal
		if (c === '"' || c === "'") {
			const quote = c;
			i++;
			let value = "";
			while (i < len && input[i] !== quote) {
				const ch = input[i]!;
				if (ch === "\\") {
					const next = input[i + 1];
					if (next === "n") value += "\n";
					else if (next === "t") value += "\t";
					else if (next === "r") value += "\r";
					else if (next === "\\") value += "\\";
					else if (next === '"') value += '"';
					else if (next === "'") value += "'";
					else if (next === undefined) {
						throw new Error("Unterminated escape at end of input");
					} else value += next;
					i += 2;
				} else {
					value += ch;
					i++;
				}
			}
			if (i >= len) throw new Error("Unterminated string literal");
			i++; // consume closing quote
			tokens.push({ type: "string", value });
			continue;
		}

		// number literal (integer or float, optional leading -)
		if (isDigit(c) || (c === "-" && isDigit(input[i + 1] ?? ""))) {
			const start = i;
			if (c === "-") i++;
			while (i < len && isDigit(input[i]!)) i++;
			if (input[i] === ".") {
				i++;
				while (i < len && isDigit(input[i]!)) i++;
			}
			const value = Number(input.slice(start, i));
			if (Number.isNaN(value)) {
				throw new Error(`Invalid number at position ${start}`);
			}
			tokens.push({ type: "number", value });
			continue;
		}

		// identifier / keyword
		if (isIdentStart(c)) {
			const start = i;
			i++;
			while (i < len && isIdentCont(input[i]!)) i++;
			const value = input.slice(start, i);
			tokens.push({ type: "ident", value });
			continue;
		}

		throw new Error(
			`Unexpected character '${c}' at position ${i} (context: ${JSON.stringify(input.slice(Math.max(0, i - 20), i + 20))})`,
		);
	}

	return tokens;
};

const parseValue = (tokens: Token[], pos: number): [LuaValue, number] => {
	const tok = tokens[pos];
	if (!tok) throw new Error("Unexpected end of input while parsing value");

	if (tok.type === "string") return [tok.value, pos + 1];
	if (tok.type === "number") return [tok.value, pos + 1];
	if (tok.type === "ident") {
		if (tok.value === "true") return [true, pos + 1];
		if (tok.value === "false") return [false, pos + 1];
		if (tok.value === "nil") return [null, pos + 1];
		throw new Error(`Unexpected identifier as value: '${tok.value}'`);
	}
	if (tok.type === "{") return parseTable(tokens, pos);

	throw new Error(`Unexpected token type '${tok.type}' while parsing value`);
};

const parseKey = (tokens: Token[], pos: number): [string, number] => {
	const tok = tokens[pos];
	if (!tok) throw new Error("Unexpected end of input while parsing key");

	// ["key"]
	if (tok.type === "[") {
		const next = tokens[pos + 1];
		if (!next || next.type !== "string") {
			throw new Error("Expected string inside [ ... ] key");
		}
		const closing = tokens[pos + 2];
		if (!closing || closing.type !== "]") {
			throw new Error('Expected ] after [ "key"');
		}
		return [next.value, pos + 3];
	}

	// identifier key
	if (tok.type === "ident") return [tok.value, pos + 1];

	throw new Error(`Unexpected token '${tok.type}' while parsing key`);
};

const parseTable = (tokens: Token[], pos: number): [LuaTable, number] => {
	const open = tokens[pos];
	if (!open || open.type !== "{") {
		throw new Error("Expected '{' at start of table");
	}
	let i = pos + 1;
	const result: LuaTable = {};

	while (i < tokens.length && tokens[i]!.type !== "}") {
		const [key, afterKey] = parseKey(tokens, i);
		i = afterKey;

		const eq = tokens[i];
		if (!eq || eq.type !== "=") {
			throw new Error(`Expected '=' after key '${key}'`);
		}
		i++;

		const [value, afterValue] = parseValue(tokens, i);
		i = afterValue;
		result[key] = value;

		const sep = tokens[i];
		if (sep && sep.type === ",") {
			i++;
			continue;
		}
		if (sep && sep.type === "}") break;
		throw new Error(
			`Expected ',' or '}' after entry, got ${sep ? sep.type : "EOF"}`,
		);
	}

	const close = tokens[i];
	if (!close || close.type !== "}") throw new Error("Unterminated table");
	return [result, i + 1];
};

// Extracts the first balanced `{ ... }` block from the input, skipping over
// Lua strings and comments so braces inside them don't confuse the depth
// counter. Lets us parse modules where the data table is wrapped in a
// `local <name> = { ... }` assignment with helper code afterward.
const extractFirstTable = (input: string): string => {
	const len = input.length;
	let i = 0;

	const skipLineComment = () => {
		while (i < len && input[i] !== "\n") i++;
	};

	const skipLongBracket = () => {
		// Caller has already consumed the opening `[[`.
		while (i < len && !(input[i] === "]" && input[i + 1] === "]")) i++;
		if (i < len) i += 2;
	};

	const skipString = (quote: string) => {
		i++; // consume opening quote
		while (i < len && input[i] !== quote) {
			if (input[i] === "\\") i++; // skip escape
			i++;
		}
		if (i < len) i++; // consume closing quote
	};

	const handleNonStructural = (): boolean => {
		const c = input[i];
		if (c === "-" && input[i + 1] === "-") {
			i += 2;
			if (input[i] === "[" && input[i + 1] === "[") {
				i += 2;
				skipLongBracket();
			} else {
				skipLineComment();
			}
			return true;
		}
		if (c === '"' || c === "'") {
			skipString(c);
			return true;
		}
		if (c === "[" && input[i + 1] === "[") {
			i += 2;
			skipLongBracket();
			return true;
		}
		return false;
	};

	while (i < len) {
		if (handleNonStructural()) continue;
		if (input[i] === "{") break;
		i++;
	}
	if (i >= len) throw new Error("No table found in Lua input");

	const start = i;
	let depth = 0;
	while (i < len) {
		if (handleNonStructural()) continue;
		const c = input[i];
		if (c === "{") depth++;
		else if (c === "}") {
			depth--;
			if (depth === 0) {
				i++;
				return input.slice(start, i);
			}
		}
		i++;
	}
	throw new Error("Unbalanced braces in Lua input");
};

const parseLuaModule = (input: string): Record<string, LuaTable> => {
	const tableSrc = extractFirstTable(input);
	const tokens = tokenize(tableSrc);
	const [table] = parseTable(tokens, 0);

	// Module data tables map name -> entry-table. Filter out scalar entries
	// in case the source has helper assignments.
	const result: Record<string, LuaTable> = {};
	for (const [k, v] of Object.entries(table)) {
		if (v !== null && typeof v === "object") result[k] = v;
	}
	return result;
};

export type { LuaTable, LuaValue };
export { parseLuaModule };
