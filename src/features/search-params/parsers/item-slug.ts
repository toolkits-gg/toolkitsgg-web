import { parseAsString } from "nuqs/server";

export const itemSlugParser = parseAsString.withDefault("").withOptions({
	shallow: false,
	clearOnDefault: true,
});
