/**
 * Compares the local ARMORS item data array against the wiki's Cargo
 * `items` + `armor` tables joined on `item_id`, filtered to the four armor
 * classes: Helmet, Body Armor, Leg Armor, Glove Armor.
 *
 * Diffs the joined armor-table fields (`armor`, `weight`, `armor_set`, and
 * the five resistances — bleed, fire, shock, corrosive, blight) against the
 * local top-level `set` and nested `modifiers.{armor, weight, resistBleed,
 * resistFire, resistShock, resistToxin, resistBlight}` values. Wiki's
 * `corrosive_res` maps to local `resistToxin`. Numeric wiki strings are
 * coerced via `Number()` so the diff isn't fooled by `"12.7"` vs `12.7`.
 *
 * Description is intentionally not diffed: the wiki's `items.description`
 * column is empty for armor pages (the prose lives in a different template
 * field), so comparing it just produces noise.
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/armors.ts
 */

import { ARMORS } from "#/games/remnant2/core/item-data/armors.ts";
import { syncWikiCategory } from "#/games/remnant2/wiki/sync-category.ts";

const ARMOR_EXTRA_TABLES = "armor";
const ARMOR_EXTRA_FIELDS =
	"armor.armor_set=set,armor,weight,bleed_res=bleed,fire_res=fire,shock_res=shock,corrosive_res=corrosive,blight_res=blight";
const ARMOR_JOIN_ON = "items.item_id=armor.item_id";

const mapArmorWikiFields = (
	_lines: string[],
	row: Record<string, string | number | boolean | null>,
) => {
	const setRaw = row.set;
	const set = typeof setRaw === "string" && setRaw !== "" ? setRaw : undefined;
	return {
		set,
		"modifiers.armor": Number(row.armor),
		"modifiers.weight": Number(row.weight),
		"modifiers.resistBleed": Number(row.bleed),
		"modifiers.resistFire": Number(row.fire),
		"modifiers.resistShock": Number(row.shock),
		"modifiers.resistToxin": Number(row.corrosive),
		"modifiers.resistBlight": Number(row.blight),
	};
};

const ARMOR_CLASSES = [
	"Helmet",
	"Body Armor",
	"Leg Armor",
	"Glove Armor",
] as const;

void syncWikiCategory(
	ARMOR_CLASSES.map((category) => ({
		category,
		label: "armors",
		localItems: ARMORS,
		extraTables: ARMOR_EXTRA_TABLES,
		extraFields: ARMOR_EXTRA_FIELDS,
		joinOn: ARMOR_JOIN_ON,
		mapWikiFields: mapArmorWikiFields,
	})),
);
