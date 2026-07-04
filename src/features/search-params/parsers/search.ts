import { parseAsString } from "nuqs";

export const searchParser = parseAsString.withDefault("").withOptions({
	shallow: false,
	clearOnDefault: true,
});
