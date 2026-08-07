import { parseAsString } from "nuqs";

export const sortParser = {
	sortKey: parseAsString.withDefault("createdAt"),
	sortValue: parseAsString.withDefault("desc"),
};

export const sortOptions = {
	shallow: false,
	clearOnDefault: true,
};
