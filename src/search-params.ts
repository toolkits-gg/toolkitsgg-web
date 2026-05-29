import {
	createSearchParamsCache,
	parseAsArrayOf,
	parseAsBoolean,
	parseAsInteger,
	parseAsString,
} from "nuqs/server";

const searchParser = parseAsString.withDefault("").withOptions({
	shallow: false,
	clearOnDefault: true,
});

const itemSlugParser = parseAsString.withDefault("").withOptions({
	shallow: false,
	clearOnDefault: true,
});

const sortParser = {
	sortKey: parseAsString.withDefault("createdAt"),
	sortValue: parseAsString.withDefault("desc"),
};

const sortOptions = {
	shallow: false,
	clearOnDefault: true,
};

const paginationParser = {
	page: parseAsInteger.withDefault(0),
	size: parseAsInteger.withDefault(16),
};

const paginationOptions = {
	shallow: false,
	clearOnDefault: true,
};

const patchParser = parseAsString.withDefault("").withOptions({
	shallow: false,
	clearOnDefault: true,
});

const dimUncollectedItemsParser = parseAsBoolean
	.withDefault(false)
	.withOptions({
		shallow: true,
		clearOnDefault: true,
	});

const showUncollectedItemsParser = parseAsBoolean
	.withDefault(true)
	.withOptions({
		shallow: true,
		clearOnDefault: true,
	});

const showCollectedItemsParser = parseAsBoolean.withDefault(true).withOptions({
	shallow: true,
	clearOnDefault: true,
});

const compareItemsParser = parseAsArrayOf(parseAsString)
	.withDefault([])
	.withOptions({
		shallow: true,
		clearOnDefault: true,
	});

const showCollectableOnlyParser = parseAsBoolean
	.withDefault(false)
	.withOptions({
		shallow: true,
		clearOnDefault: true,
	});

const baseSearchParamsCache = createSearchParamsCache({
	search: searchParser,
	itemSlug: itemSlugParser,
	dimUncollectedItems: dimUncollectedItemsParser,
	showUncollectedItems: showUncollectedItemsParser,
	showCollectedItems: showCollectedItemsParser,
	showCollectableOnly: showCollectableOnlyParser,
	...sortParser,
	...paginationParser,
});

type ParsedSearchParams = Awaited<
	ReturnType<typeof baseSearchParamsCache.parse>
>;

export {
	baseSearchParamsCache,
	compareItemsParser,
	dimUncollectedItemsParser,
	itemSlugParser,
	type ParsedSearchParams,
	paginationOptions,
	paginationParser,
	patchParser,
	searchParser,
	showCollectableOnlyParser,
	showCollectedItemsParser,
	showUncollectedItemsParser,
	sortOptions,
	sortParser,
};
