import { parseAsInteger } from "nuqs/server";

export const paginationParser = {
	page: parseAsInteger.withDefault(0),
	size: parseAsInteger.withDefault(16),
};

export const paginationOptions = {
	shallow: false,
	clearOnDefault: true,
};
