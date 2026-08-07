import { parseAsBoolean } from "nuqs/server";

export const dimUncollectedItemsParser = parseAsBoolean
	.withDefault(false)
	.withOptions({
		shallow: true,
		clearOnDefault: true,
	});

export const showUncollectedItemsParser = parseAsBoolean
	.withDefault(true)
	.withOptions({
		shallow: true,
		clearOnDefault: true,
	});

export const showCollectedItemsParser = parseAsBoolean
	.withDefault(true)
	.withOptions({
		shallow: true,
		clearOnDefault: true,
	});

export const showCollectableOnlyParser = parseAsBoolean
	.withDefault(false)
	.withOptions({
		shallow: true,
		clearOnDefault: true,
	});
