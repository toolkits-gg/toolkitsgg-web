import type { ItemTag } from "#/features/game/items/types";
import { ARCHETYPE_COLORS } from "#/games/remnant2/core/constants";

/**
 * These tags are highlighted inline in item descriptions throughout the toolkit.
 */
const INLINE_ITEM_TAGS = [
	{
		type: "Acid",
		token: "ACID",
		color: {
			light: "#497F51",
			dark: "#589961",
		},
		description: "Elemental Damage.",
	},
	{
		type: "Alchemist",
		token: "ALCHEMIST",
		color: {
			light: ARCHETYPE_COLORS.ALCHEMIST.text.light,
			dark: ARCHETYPE_COLORS.ALCHEMIST.text.dark,
		},
		description: undefined,
	},
	{
		type: "Archon",
		token: "ARCHON",
		color: {
			light: ARCHETYPE_COLORS.ARCHON.text.light,
			dark: ARCHETYPE_COLORS.ARCHON.text.dark,
		},
		description: undefined,
	},
	{
		type: "Bleeding",
		token: "BLEEDING",
		color: {
			light: "#C92C0C",
			dark: "#f2350f",
		},
		description:
			"Deals Physical Damage per second. Reduces healing effectiveness by 50%.",
	},
	{
		type: "Bleeding",
		token: "BLEED",
		color: {
			light: "#C92C0C",
			dark: "#f2350f",
		},
		description:
			"Deals Physical Damage per second. Reduces healing effectiveness by 50%.",
	},
	{
		type: "Brittle",
		token: "BRITTLE",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description:
			"BRITTLE: Increases incoming Critical Chance by 10% and Critical Damage by 15%.",
	},
	{
		type: "Blowback",
		token: "BLOWBACK",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
	{
		type: "Burning",
		token: "BURNING",
		color: {
			light: "#974D28",
			dark: "#b65d30",
		},
		description: "Deals elemental FIRE damage. Can make enemies panic.",
	},
	{
		type: "Bulwark",
		token: "BULWARK",
		color: {
			light: ARCHETYPE_COLORS.CHALLENGER.text.light,
			dark: ARCHETYPE_COLORS.CHALLENGER.text.dark,
		},
		description:
			"Increases flat Damage Reduction per stack up to maximum of 25% at 5 stacks.",
	},
	{
		type: "Challenger",
		token: "CHALLENGER",
		color: {
			light: ARCHETYPE_COLORS.CHALLENGER.text.light,
			dark: ARCHETYPE_COLORS.CHALLENGER.text.dark,
		},
		description: undefined,
	},
	{
		type: "Call of the Doe",
		token: "CALL OF THE DOE",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
	{
		type: "Contamination",
		token: "CONTAMINATION",
		color: {
			light: "#6A006A",
			dark: "#800080",
		},
		description:
			"Inflicts a burst of damage after which it resets allowing another build-up.",
	},
	{
		type: "Corroded",
		token: "CORRODED",
		color: {
			light: "#0a751e",
			dark: "#0fa82b",
		},
		description: "Increases damage taken by 10%.",
	},
	{
		type: "Corrosive",
		token: "CORROSIVE",
		color: {
			light: "#497F51",
			dark: "#589961",
		},
		description: "Elemental Damage.",
	},
	{
		type: "Critical Damage",
		token: "Crit Damage",
		color: {
			light: "#C63838",
			dark: "#ef4444",
		},
		description:
			"Base 50%. Critical Damage is multiplicative with different sources of damage.",
	},
	{
		type: "Critical Damage",
		token: "Critical Damage",
		color: {
			light: "#C63838",
			dark: "#ef4444",
		},
		description:
			"Base 50%. Critical Damage is multiplicative with different sources of damage.",
	},
	{
		type: "Curse",
		token: "CURSE",
		color: {
			light: "#681B83",
			dark: "#7d219e",
		},
		description: "Reduces maximum Health by 10% per stack. Maximum 5 stacks.",
	},
	{
		type: "Data corruption",
		token: "DATA CORRUPTION",
		color: {
			light: "#9CA3AF",
			dark: "#9CA3AF",
		},
		description:
			"Disables skills, relic, and consumables use for a short duration.", // TODO: I think it also deals damage and staggers but need to verify.
	},
	{
		type: "Defrag",
		token: "DEFRAG",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
	{
		type: "Drenched",
		token: "DRENCHED",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description:
			"DRENCHED: Reduces Movement Speed by 10%. Every few seconds, lightning strikes enemies dealing 300 base SHOCK damage split among DRENCHED targets.",
	},
	{
		type: "Elemental Damage",
		token: "Elemental Damage",
		color: {
			light: "#0a7552",
			dark: "#0fa82b",
		},
		description: `Acid, Corrosive, Fire, Shock, certain skills and mods.`,
	},
	{
		type: "Engineer",
		token: "ENGINEER",
		color: {
			light: ARCHETYPE_COLORS.ENGINEER.text.light,
			dark: ARCHETYPE_COLORS.ENGINEER.text.dark,
		},
		description: undefined,
	},
	{
		type: "Explorer",
		token: "EXPLORER",
		color: {
			light: ARCHETYPE_COLORS.EXPLORER.text.light,
			dark: ARCHETYPE_COLORS.EXPLORER.text.dark,
		},
		description: undefined,
	},
	{
		type: "EXPOSED",
		token: "EXPOSED",
		color: {
			light: "#6d6a46",
			dark: "#fef9c3",
		},
		description: "Target receives 15% additional damage from all sources.",
	},
	{
		type: "Fire",
		token: "FIRE",
		color: {
			light: "#A94700",
			dark: "#cc5500",
		},
		description: "Elemental Damage.",
	},
	{
		type: "Frenzied",
		token: "FRENZIED",
		color: {
			light: "#6d6a46",
			dark: "#fef9c3",
		},
		description:
			"FRENZIED increases Fire Rate, Reload Speed, and Melee Speed by 20%, and Movement Speed by 15%. Lasts 15s.",
	},
	{
		type: "Living Will",
		token: "LIVING WILL",
		color: {
			light: "#6d6a46",
			dark: "#fef9c3",
		},
		description:
			"LIVING WILL grants 5 Health Regeneration per second, and protects against fatal damage. Can revive downed players. Lasts 20s.",
	},
	{
		type: "Stoneskin",
		token: "STONESKIN",
		color: {
			light: "#6d6a46",
			dark: "#fef9c3",
		},
		description:
			"STONESKIN reduces incoming damage by 25%, reduces Stagger by 1, greatly increases Blight Buildup Decay Rate, and makes the target immune to STATUS Effects. Lasts 15s.",
	},
	{
		type: "Unbridled Chaos",
		token: "UNBRIDLED CHAOS",
		color: {
			light: "#6d6a46",
			dark: "#fef9c3",
		},
		description:
			"UNBRIDLED CHAOS: Allies gain 0.7% to All Damage dealt and receive 0.3% damage taken. Stacks up to 50 times. Lasts 10s.",
	},
	{
		type: "Gloom",
		token: "GLOOM",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: "GLOOM: Increases incoming Elemental damage by 15%.",
	},
	{
		type: "Gunslinger",
		token: "GUNSLINGER",
		color: {
			light: ARCHETYPE_COLORS.GUNSLINGER.text.light,
			dark: ARCHETYPE_COLORS.GUNSLINGER.text.dark,
		},
		description: undefined,
	},
	{
		type: "Handler",
		token: "HANDLER",
		color: {
			light: ARCHETYPE_COLORS.HANDLER.text.light,
			dark: ARCHETYPE_COLORS.HANDLER.text.dark,
		},
		description: undefined,
	},
	{
		type: "Haste",
		token: "HASTE",
		color: {
			light: "text-[#6b6b47]",
			dark: "dark:text-[#f1f1cf]",
		},
		description: `Increases the speed of player's actions by 7%.`,
	},
	{
		type: "Hunter",
		token: "HUNTER",
		color: {
			light: ARCHETYPE_COLORS.HUNTER.text.light,
			dark: ARCHETYPE_COLORS.HUNTER.text.dark,
		},
		description: undefined,
	},
	{
		type: "Invader",
		token: "INVADER",
		color: {
			light: ARCHETYPE_COLORS.INVADER.text.light,
			dark: ARCHETYPE_COLORS.INVADER.text.dark,
		},
		description: undefined,
	},
	{
		type: "Invoker",
		token: "INVOKER",
		color: {
			light: ARCHETYPE_COLORS.INVOKER.text.light,
			dark: ARCHETYPE_COLORS.INVOKER.text.dark,
		},
		description: undefined,
	},
	{
		type: "Lifesteal",
		token: "Lifesteal",
		color: {
			light: "#CB344E",
			dark: "#F43F5E",
		},
		description:
			"Unupgraded Base Damage only. Doesn't work with Healing Effectiveness.",
	},
	{
		type: "Madness",
		token: "MADNESS",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
	{
		type: "Marked",
		token: "MARKED",
		color: {
			light: ARCHETYPE_COLORS.GUNSLINGER.text.light,
			dark: ARCHETYPE_COLORS.GUNSLINGER.text.dark,
		},
		description:
			"Critical Chance against MARKED enemies is increased by 15% for all allies.",
	},
	{
		type: "Medic",
		token: "MEDIC",
		color: {
			light: ARCHETYPE_COLORS.MEDIC.text.light,
			dark: ARCHETYPE_COLORS.MEDIC.text.dark,
		},
		description: undefined,
	},
	{
		type: "OPPORTUNITY",
		token: "OPPORTUNITY",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
	{
		type: "Power Stone",
		token: "POWER STONE",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
	{
		type: "Overloaded",
		token: "OVERLOADED",
		color: {
			light: "#626291",
			dark: "#7676af",
		},
		description:
			"Deals SHOCK area damage every 5 seconds. Damage increases by 10% for every OVERLOADED enemy nearby.", // TODO What's the range and what's the max damage increase for secondary effect?
	},
	{
		type: "Ritualist",
		token: "RITUALIST",
		color: {
			light: ARCHETYPE_COLORS.RITUALIST.text.light,
			dark: ARCHETYPE_COLORS.RITUALIST.text.dark,
		},
		description: undefined,
	},
	{
		type: "Root Rot",
		token: "ROOT ROT",
		color: {
			light: "#A45605",
			dark: "#c66806",
		},
		description:
			"Reduces maximum Stamina by 33%. Forces coughing animation at random intervals.",
	},
	{
		type: "Shield",
		token: "SHIELD",
		color: {
			light: "#357273",
			dark: "#80e0e1",
		},
		description: `Shields stack up to 100% of Total Health.`,
	},
	{
		type: "Shock",
		token: "SHOCK",
		color: {
			light: "#4C4CAB",
			dark: "#5c5cce",
		},
		description: "Elemental Damage. Deals double damage to shields.",
	},
	{
		type: "Slow",
		token: "SLOW",
		color: {
			light: "#6b6b47",
			dark: "#f1f1cf",
		},
		description:
			"Reduces target speed. 99% reduced effect against Bosses and Aberrations.",
	},
	{
		type: "Summoner",
		token: "SUMMONER",
		color: {
			light: ARCHETYPE_COLORS.SUMMONER.text.light,
			dark: ARCHETYPE_COLORS.SUMMONER.text.dark,
		},
		description: undefined,
	},
	{
		type: "Warden",
		token: "WARDEN",
		color: {
			light: ARCHETYPE_COLORS.WARDEN.text.light,
			dark: ARCHETYPE_COLORS.WARDEN.text.dark,
		},
		description: undefined,
	},
	{
		type: "Suppression",
		token: "SUPPRESSION",
		color: {
			light: "#383A51",
			dark: "#444662",
		},
		description: "Reduces Mod Power Generation by 50%.",
	},
	{
		type: "Weakspot Damage",
		token: "Weakspot Damage",
		color: {
			light: "#C63838",
			dark: "#ef4444",
		},
		description:
			"Weakspot Damage is multiplicative with different sources of damage.",
	},
	{
		type: "Negative Status Effects",
		token: "Negative Status Effects",
		color: {
			light: "#885EB3",
			dark: "#885EB3",
		},
		description: `Bleeding, Burning, Corroded, Overloaded, Slow.`,
	},
	{
		type: "Negative Status Effect",
		token: "Negative Status Effect",
		color: {
			light: "#885EB3",
			dark: "#885EB3",
		},
		description: `Bleeding, Burning, Corroded, Overloaded, Slow.`,
	},
	{
		type: "Negative Status",
		token: "Negative Status",
		color: {
			light: "#885EB3",
			dark: "#885EB3",
		},
		description: `Bleeding, Burning, Corroded, Overloaded, Slow.`,
	},
	{
		type: "Elemental Status Effects",
		token: "Elemental Status Effects",
		color: {
			light: "#036f96",
			dark: "#1e40af",
		},
		description: `Burning, Corroded, Overloaded.`,
	},
	{
		type: "Elemental Status Effect",
		token: "Elemental Status Effect",
		color: {
			light: "#036f96",
			dark: "#1e40af",
		},
		description: `Burning, Corroded, Overloaded.`,
	},
	{
		type: "Elemental Status",
		token: "Elemental Status",
		color: {
			light: "#036f96",
			dark: "#1e40af",
		},
		description: `Burning, Corroded, Overloaded.`,
	},
	{
		type: "Status Effects",
		token: "Status Effects",
		color: {
			light: "#885EB3",
			dark: "#885EB3",
		},
		description: `Bleeding, Burning, Corroded, Overloaded, Slow.`,
	},
	{
		type: "Status Effect",
		token: "Status Effect",
		color: {
			light: "#885EB3",
			dark: "#885EB3",
		},
		description: `Bleeding, Burning, Corroded, Overloaded, Slow.`,
	},
	{
		type: "MARKED",
		token: "MARKED",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
	{
		type: "MARK",
		token: "MARK",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description:
			"MARK: Crit Chance against MARKED enemies is increased by 10% for all allies.",
	},
	{
		type: "AMBUSH",
		token: "AMBUSH",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description:
			"AMBUSH: Increases Ranged and Melee Damage by 50% which diminishes over its duration. Ranged and Melee attacks apply MARK.",
	},
	{
		type: "FOCUSED",
		token: "FOCUSED",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description:
			"FOCUSED reduces Weapon Spread, Recoil, and Sway by 50% and grants 25% Ranged & Ranged Weakspot Damage.",
	},
	{
		type: "GIFT OF THE FOREST",
		token: "GIFT OF THE FOREST",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
	{
		type: "Warded Target",
		token: "Warded Target",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: undefined,
	},
] as const satisfies ItemTag[];

export { INLINE_ITEM_TAGS };
