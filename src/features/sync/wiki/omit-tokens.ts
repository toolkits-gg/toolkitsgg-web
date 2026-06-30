// Literal substrings that should be stripped from wiki text during cleaning.
// Add tokens here so that both `clean-wiki-text` and `clean-cargo-html` will
// drop them. Tokens are matched as literal strings (no regex syntax), the
// matcher below escapes them.

const OMIT_TOKENS: string[] = ["[sic]"];

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const OMIT_TOKENS_REGEX =
	OMIT_TOKENS.length === 0
		? null
		: new RegExp(OMIT_TOKENS.map(escapeRegex).join("|"), "g");

const stripOmitTokens = (text: string): string =>
	OMIT_TOKENS_REGEX === null ? text : text.replace(OMIT_TOKENS_REGEX, "");

export { OMIT_TOKENS, stripOmitTokens };
