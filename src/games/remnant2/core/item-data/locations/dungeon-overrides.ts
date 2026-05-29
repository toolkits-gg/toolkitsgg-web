import type { LabyrinthDungeon } from "#/games/remnant2/core/item-data/locations/labyrinth";
import type { LosomnDungeon } from "#/games/remnant2/core/item-data/locations/losomn";
import type { NErudDungeon } from "#/games/remnant2/core/item-data/locations/nerud";
import type { RootEarthDungeon } from "#/games/remnant2/core/item-data/locations/root-earth";
import type { YaeshaDungeon } from "#/games/remnant2/core/item-data/locations/yaesha";

/**
 * Some items can only be found in a subset of the dungeons in a biome.
 * These overrides, when present, will override the more generalized location data.
 */
const DUNGEON_OVERRIDES: Array<{
	itemId: string;
	dungeons:
		| LosomnDungeon[]
		| NErudDungeon[]
		| YaeshaDungeon[]
		| RootEarthDungeon[]
		| LabyrinthDungeon[];
}> = [
	{
		itemId: "m0l0u5", // Golden Ribbon
		dungeons: [`Gilded Chambers`, `Council Chamber`, `Glistering Cloister`],
	},
	{
		itemId: "k8j2r3", // Silver Ribbon
		dungeons: [`Shattered Gallery`, `The Great Hall`, `Pathway of the Fallen`],
	},
	{
		itemId: "ygwrpd", // Vice Grips, Ascension Spire is both an injectable and dungeon
		dungeons: ["Ascension Spire"],
	},
	{
		itemId: "2rnl2d", // Salvaged Heart, Ascension Spire is both an injectable and dungeon
		dungeons: ["Ascension Spire"],
	},
	{
		itemId: "rtfwr5", // Microcompressor, Ascension Spire is both an injectable and dungeon
		dungeons: ["Ascension Spire"],
	},
	{
		itemId: "ayje99", // Meteorite Shard Ring, Ascension Spire is both an injectable and dungeon
		dungeons: ["Ascension Spire"],
	},
	{
		itemId: "k89bxv", // Burden of the Mariner, Ascension Spire is both an injectable and dungeon
		dungeons: ["Ascension Spire"],
	},
];

export { DUNGEON_OVERRIDES };
