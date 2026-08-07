import {
	createParser,
	createSearchParamsCache,
	parseAsArrayOf,
	parseAsString,
} from "nuqs/server";
import type { TriStateFilterValue } from "#/components/TriStateFilter.tsx";
import { paginationParser } from "#/features/search-params/parsers/pagination.ts";
import { searchParser } from "#/features/search-params/parsers/search.ts";
import { sortParser } from "#/features/search-params/parsers/sort.ts";

const categoryParser = parseAsArrayOf(
	parseAsString.withOptions({
		shallow: false,
		clearOnDefault: true,
	}),
).withDefault([]);

/**
 * stores as JSON string in URL, eg. ?dlc={"BASE":"include","DLC1":"exclude"}
 */
const dlcFilterParser = createParser<TriStateFilterValue>({
	parse: (value) => {
		if (!value) return {};
		try {
			const parsed = JSON.parse(value);
			return typeof parsed === "object" && parsed !== null ? parsed : {};
		} catch {
			return {};
		}
	},
	serialize: (value) => {
		if (!value || Object.keys(value).length === 0) return "";
		return JSON.stringify(value);
	},
	eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
})
	.withDefault({})
	.withOptions({
		shallow: false,
		clearOnDefault: true,
	});

const remnant2SearchParamsCache = createSearchParamsCache({
	search: searchParser,
	category: categoryParser,
	dlc: dlcFilterParser,
	...sortParser,
	...paginationParser,
});

const SEARCH_PARAMS = remnant2SearchParamsCache;

export { categoryParser, dlcFilterParser, SEARCH_PARAMS };
