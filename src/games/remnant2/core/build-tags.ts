import type { BuildTagOption } from "#/features/game/types";
import type { Remnant2BuildTagName } from "@/prisma";

/**
 * Single source of truth for Remnant 2 build tags.
 *
 * `Remnant2BuildTag.tag` is a String column rather than the Prisma enum, so
 * validation lives here instead: the zod validator in created-builds.ts and the
 * editor's options both read from this map.
 *
 * The `Record<Remnant2BuildTagName, string>` annotation is what keeps it true.
 *
 * The import is type-only, so this module stays safe to load on the client.
 */
const REMNANT2_BUILD_TAG_LABELS: Record<Remnant2BuildTagName, string> = {
	EasyToPlay: "Easy to Play",
	Melee: "Melee",
	Mods: "Mods",
	Ranged: "Ranged",
	Skills: "Skills",
	StatusEffects: "Status Effects",
	Support: "Support",
	Tank: "Tank",
	BaseGame: "Base Game",
	Beginner: "Beginner",
	BossRush: "Boss Rush",
	Gimmick: "Gimmick",
};

const REMNANT2_BUILD_TAG_VALUES = Object.keys(REMNANT2_BUILD_TAG_LABELS) as [
	Remnant2BuildTagName,
	...Remnant2BuildTagName[],
];

const REMNANT2_BUILD_TAG_OPTIONS: BuildTagOption[] =
	REMNANT2_BUILD_TAG_VALUES.map((value) => ({
		value,
		label: REMNANT2_BUILD_TAG_LABELS[value],
	}));

export { REMNANT2_BUILD_TAG_OPTIONS, REMNANT2_BUILD_TAG_VALUES };
