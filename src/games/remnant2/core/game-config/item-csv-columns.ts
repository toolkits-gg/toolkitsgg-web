import type { ItemCsvColumn } from "#/features/game/items/item-csv";
import type { AppItem } from "#/features/game/types";
import { REMNANT2_DLC_LABELS } from "#/games/remnant2/core/game-config/dlc-labels";
import type { Remnant2ItemLocation } from "#/games/remnant2/core/types";
import type { Remnant2DLC } from "@/prisma";

/**
 * The item list flows base `AppItem`, so the Remnant 2 fields have to be read
 * back off the widened type, the same way the game's filters do.
 */
type Remnant2ItemFields = {
	dlc?: Remnant2DLC;
	wikiUrl?: string;
	location?: Remnant2ItemLocation;
};

const remnant2Fields = (item: AppItem): Remnant2ItemFields =>
	item as AppItem & Remnant2ItemFields;

const formatLocation = (location: Remnant2ItemLocation | undefined): string => {
	if (!location) return "";

	// Only some worlds carry a biome or an injectable, so read the union widened.
	const { world, dungeon, biome, injectable } = location as {
		world: string;
		dungeon?: string[] | string;
		biome?: string;
		injectable?: string;
	};

	const place = Array.isArray(dungeon)
		? dungeon.join("; ")
		: (dungeon ?? biome ?? "");

	const base = place ? `${world} / ${place}` : world;
	return injectable ? `${base} (${injectable})` : base;
};

const REMNANT2_ITEM_CSV_COLUMNS: ItemCsvColumn[] = [
	{
		header: "DLC",
		getValue: (item) => {
			const dlc = remnant2Fields(item).dlc;
			return dlc ? (REMNANT2_DLC_LABELS[dlc] ?? dlc) : "";
		},
	},
	{
		header: "Location",
		getValue: (item) => formatLocation(remnant2Fields(item).location),
	},
	{
		header: "Wiki URL",
		getValue: (item) => remnant2Fields(item).wikiUrl ?? "",
	},
];

export { REMNANT2_ITEM_CSV_COLUMNS };
