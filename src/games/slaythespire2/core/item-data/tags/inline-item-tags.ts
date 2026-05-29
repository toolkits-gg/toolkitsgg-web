import type { ItemTag } from "#/features/game/items/types";

/**
 * These tags are highlighted inline in item descriptions throughout the toolkit.
 */
const INLINE_ITEM_TAGS = [
	{
		type: "attack",
		token: "Attack",
		color: {
			light: "#e63946",
			dark: "#e63946",
		},
		description: undefined,
	},
	{
		type: "block",
		token: "Block",
		color: {
			light: "#457b9d",
			dark: "#457b9d",
		},
		description: `Until next turn, prevents damage.`,
		icon: "icons/block_icon.webp", // TODO: Get better version
	},
	{
		type: "buffer",
		token: "Buffer",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: `Prevent the next time that you would lose HP.`,
	},
	{
		type: "colorless",
		token: "Colorless",
		color: {
			light: "#6c757d",
			dark: "#6c757d",
		},
		description: undefined,
	},
	{
		type: "dark",
		token: "Dark",
		color: {
			light: "#6c757d",
			dark: "#6c757d",
		},
		description: undefined,
	},
	{
		type: "dexterity",
		token: "Dexterity",
		color: {
			light: "#1b9a7c",
			dark: "#1b9a7c",
		},
		description: `Improves Block gained from cards.`,
	},
	{
		type: "doom",
		token: "Doom",
		color: {
			light: "#6a0dad",
			dark: "#6a0dad",
		},
		description: `Doom is a resource that counts down each turn. When it reaches 0, you lose.`,
	},
	{
		type: "energy",
		token: "Energy",
		color: {
			light: "#f4a261",
			dark: "#f4a261",
		},
		icon: "icons/colorless_energy_icon.png",
		description: `Resource used to play cards.`,
	},
	{
		type: "exhaust",
		token: "Exhaust",
		color: {
			light: "#6c757d",
			dark: "#6c757d",
		},
		description: `Removed until the end of combat.`,
	},
	{
		type: "focus",
		token: "Focus",
		color: {
			light: "#9b5de5",
			dark: "#9b5de5",
		},
		description: `Focus increases the effectiveness of Channeled orbs by X.`,
		icon: "icons/focus_icon.webp", // TODO: Get better version
	},
	{
		type: "forge",
		token: "Forge",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: `The first time you forge each combat, add Sovereign Blade into your Hand. Adds additional damage to Sovereign Blade.`,
	},
	{
		type: "frail",
		token: "Forge",
		color: {
			light: "#e76f51",
			dark: "#e76f51",
		},
		description: `Gain 25% less from blocks for the next X turns.`,
	},
	{
		type: "intangible",
		token: "Intangible",
		color: {
			light: "#6c757d",
			dark: "#6c757d",
		},
		description: `Reduces all damage taken and HP loss to 1 this turn.`,
	},
	{
		type: "miracle",
		token: "Miracle",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: ``,
	},
	{
		type: "orb slots",
		token: "Orb Slots",
		color: {
			light: "#9b5de5",
			dark: "#9b5de5",
		},
		description: undefined,
	},
	{
		type: "poison",
		token: "Poison",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: `Poisoned creatures lose X HP at the start of their turn. Each turn, Poison is reduced by 1.`,
	},
	{
		type: "power",
		token: "Power",
		color: {
			light: "#9b5de5",
			dark: "#9b5de5",
		},
		description: `Powers are buffs that last until the end of combat.`,
	},
	{
		type: "regen",
		token: "Regen",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: `Regen heals HP at the end of your turn. Each turn, Regen is reduced by 1.`,
	},
	{
		type: "replay",
		token: "Replay",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: `Plays this card an additional time.`,
	},
	{
		type: "retain",
		token: "Retain",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: `Retained cards are not discarded at the end of your turn.`,
	},
	{
		type: "skill",
		token: "Skill",
		color: {
			light: "#3a86ff",
			dark: "#3a86ff",
		},
		description: undefined,
	},
	{
		type: "souls",
		token: "Souls",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: undefined,
	},
	{
		type: "star",
		token: "Star",
		color: {
			light: "#fcbf49",
			dark: "#fcbf49",
		},
		description: `The Regent's Stars. The Stars are an alternate resource to play cards.`,
	},
	{
		type: "strength",
		token: "Strength",
		color: {
			light: "#d62828",
			dark: "#d62828",
		},
		description: `Strength adds additional damage to attacks.`,
	},
	{
		type: "strike",
		token: "Strike",
		color: {
			light: "#e63946",
			dark: "#e63946",
		},
		description: undefined,
	},
	{
		type: "summon",
		token: "Summon",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description: `Summon Osty with X HP. If already summoned, raise his max HP by X for this combat.`,
	},
	{
		type: "upgrade",
		token: "Upgrade",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description:
			"Upgrading cards makes them more powerful. Most cards can only be upgraded once.",
	},
	{
		type: "upgraded",
		token: "Upgraded",
		color: {
			light: "#2a9d8f",
			dark: "#2a9d8f",
		},
		description:
			"Upgrading cards makes them more powerful. Most cards can only be upgraded once.",
	},
	{
		type: "vulnerable",
		token: "Vulnerable",
		color: {
			light: "#e76f51",
			dark: "#e76f51",
		},
		description: `Vulnerable creatures take 50% more damage from attacks.`,
	},
	{
		type: "weak",
		token: "Weak",
		color: {
			light: "#e76f51",
			dark: "#e76f51",
		},
		description: `Weak creatures deal 25% less damage with Attacks.`,
	},
] as const satisfies ItemTag[];

export { INLINE_ITEM_TAGS };
