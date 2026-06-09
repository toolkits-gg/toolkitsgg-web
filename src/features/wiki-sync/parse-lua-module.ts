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

type PunctuationToken = Extract<
	Token,
	{ type: "{" | "}" | "[" | "]" | "=" | "," }
>["type"];

const PUNCTUATION = new Set<string>(["{", "}", "[", "]", "=", ","]);

const isWhitespace = (c: string | undefined): boolean =>
	c === " " || c === "\t" || c === "\n" || c === "\r";

const isDigit = (c: string | undefined): boolean =>
	c !== undefined && c >= "0" && c <= "9";

const isIdentStart = (c: string | undefined): boolean =>
	c !== undefined && /[A-Za-z_]/.test(c);

const isIdentCont = (c: string | undefined): boolean =>
	c !== undefined && /[A-Za-z0-9_]/.test(c);

const isQuote = (c: string | undefined): c is '"' | "'" =>
	c === '"' || c === "'";

const isPunctuation = (c: string | undefined): c is PunctuationToken =>
	c !== undefined && PUNCTUATION.has(c);

const skipLineComment = (input: string, start: number): number => {
	let i = start;
	while (i < input.length && input[i] !== "\n") i++;
	return i;
};

const readEscapedChar = (input: string, slashIndex: number): string => {
	const next = input[slashIndex + 1];

	switch (next) {
		case "n":
			return "\n";
		case "t":
			return "\t";
		case "r":
			return "\r";
		case "\\":
			return "\\";
		case '"':
			return '"';
		case "'":
			return "'";
		case undefined:
			throw new Error("Unterminated escape at end of input");
		default:
			return next;
	}
};

const readString = (input: string, start: number): [Token, number] => {
	const quote = input[start];
	if (!isQuote(quote)) {
		throw new Error(`Expected string literal at position ${start}`);
	}

	let i = start + 1;
	let value = "";

	while (i < input.length && input[i] !== quote) {
		const ch = input[i];

		if (ch === "\\") {
			value += readEscapedChar(input, i);
			i += 2;
			continue;
		}

		value += ch;
		i++;
	}

	if (i >= input.length) throw new Error("Unterminated string literal");

	return [{ type: "string", value }, i + 1];
};

const readNumber = (input: string, start: number): [Token, number] => {
	let i = start;
	if (input[i] === "-") i++;

	while (isDigit(input[i])) i++;

	if (input[i] === ".") {
		i++;
		while (isDigit(input[i])) i++;
	}
	const value = Number(input.slice(start, i));
	if (Number.isNaN(value)) {
		throw new Error(`Invalid number at position ${start}`);
	}
	return [{ type: "number", value }, i];
};

const readIdentifier = (input: string, start: number): [Token, number] => {
	let i = start + 1;
	while (isIdentCont(input[i])) i++;
	return [{ type: "ident", value: input.slice(start, i) }, i];
};

const unexpectedCharacterError = (input: string, position: number): Error => {
	const context = input.slice(Math.max(0, position - 20), position + 20);
	return new Error(
		`Unexpected character '${input[position]}' at position ${position} (context: ${JSON.stringify(context)})`,
	);
};

const tokenize = (input: string): Token[] => {
	const tokens: Token[] = [];
	let i = 0;

	while (i < input.length) {
		const c = input[i];

		if (isWhitespace(c)) {
			i++;
			continue;
		}

		if (c === "-" && input[i + 1] === "-") {
			i = skipLineComment(input, i);
			continue;
		}

		if (isPunctuation(c)) {
			tokens.push({ type: c });
			i++;
			continue;
		}

		if (isQuote(c)) {
			const [token, next] = readString(input, i);
			tokens.push(token);
			i = next;
			continue;
		}

		if (isDigit(c) || (c === "-" && isDigit(input[i + 1]))) {
			const [token, next] = readNumber(input, i);
			tokens.push(token);
			i = next;
			continue;
		}

		if (isIdentStart(c)) {
			const [token, next] = readIdentifier(input, i);
			tokens.push(token);
			i = next;
			continue;
		}

		throw unexpectedCharacterError(input, i);
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

	while (i < tokens.length && tokens[i].type !== "}") {
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
