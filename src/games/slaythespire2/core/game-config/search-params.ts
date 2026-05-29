import {
	createParser,
	createSearchParamsCache,
	parseAsArrayOf,
	parseAsString,
} from "nuqs/server";
import type { TriStateFilterValue } from "#/components/TriStateFilter";
import {
	paginationParser,
	patchParser,
	searchParser,
	sortParser,
} from "#/search-params";

const categoryParser = parseAsArrayOf(
	parseAsString.withOptions({
		shallow: false,
		clearOnDefault: true,
	}),
).withDefault([]);

/**
 * stores as JSON string in URL, e.g. ?dlc={"BASE":"include","DLC1":"exclude"}
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

const slayTheSpire2SearchParamsCache = createSearchParamsCache({
	search: searchParser,
	category: categoryParser,
	dlc: dlcFilterParser,
	patch: patchParser,
	...sortParser,
	...paginationParser,
});

const SEARCH_PARAMS = slayTheSpire2SearchParamsCache;

export { categoryParser, dlcFilterParser, type patchParser, SEARCH_PARAMS };
