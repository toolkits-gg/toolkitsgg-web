import type { BaseRemnant2Item } from "#/games/remnant2/core/types";

type Remnant2ConcoctionItem = BaseRemnant2Item & {};

const CONCOCTIONS: Remnant2ConcoctionItem[] = [
	{
		category: "CONCOCTION",
		name: "Bark Extract",
		imageUrl: "items/consumables/barkextract.png",
		internalSlug: "Consumable_BarkExtract_C",
		id: "hqjxyn",
		dlc: "BASE",
		searchableTags: ["Armor Increase", "Damage Reduction", "Consumable"],
		description: [
			"Increases Armor by 30.",
			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Bark_Extract`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		modifiers: {
			armor: 30,
		},
	},
	{
		category: "CONCOCTION",
		name: "Bottled Shaedberry",
		imageUrl: "items/consumables/bottledshaedberry.png",
		internalSlug: "Consumable_BottledShaedberry_C",
		id: "qj302c",
		dlc: "BASE",
		searchableTags: ["Mod Power", "Consumable"],
		description: [
			"Increases Mod Power Generation by 10%.",
			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Bottled_Shaedberry`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: "Chilled Steam",
		imageUrl: "items/consumables/chilledsteam.png",
		internalSlug: "Consumable_ChilledSteam_C",
		id: "fhm256",
		dlc: "BASE",
		searchableTags: ["Movement Speed", "Consumable"],
		description: [
			"Increases Movement Speed by 10%.",
			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Chilled_Steam`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: "Dark Cider",
		imageUrl: "items/consumables/darkcider.png",
		internalSlug: "Consumable_DarkCider_C",
		id: "8p2sj3",
		dlc: "BASE",
		searchableTags: ["Health", "Stamina", "Movement Speed", "Consumable"],
		description: [
			"Increases Health by 6.66%, Stamina by 6.66%, and Movement Speed by 6.66%.",
			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Dark_Cider`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		modifiers: {
			healthPercentage: 0.0666,
			staminaPercentage: 0.0666,
		},
	},
	{
		category: "CONCOCTION",
		name: "Dark Fluid",
		imageUrl: "items/consumables/darkfluid.png",
		internalSlug: "Consumable_DarkFluid_C",
		id: "byi9a5",
		dlc: "BASE",
		searchableTags: [
			"Perfect Dodge",
			"Neutral Dodge",
			"Perfect Neutral Evade",
			"Consumable",
		],
		description: [
			"Increases Distance of Evade and Combat Slide by 15% and reduces the cost by 20%.",
			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Dark_Fluid`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: "Egg Drink",
		imageUrl: "items/consumables/eggdrink.png",
		internalSlug: "Consumable_EggDrink_C",
		id: "byi9d",
		dlc: "DLC2",
		searchableTags: ["Encumbrance"],
		description: [
			"Increases Dodge Weight Threshold by 10.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Egg_Drink`,
		location: { world: "Ward 13", dungeon: "Quest" },
		modifiers: {
			weightThreshold: 10,
		},
	},
	{
		category: "CONCOCTION",
		name: "Meat Shake",
		imageUrl: "items/consumables/meatshake.png",
		internalSlug: "Consumable_MeatShake_C",
		id: "4yzeco",
		dlc: "DLC1",
		searchableTags: ["Damage Reduction", "Consumable"],
		description: [
			"Increases Damage Reduction by 6.5%.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Meat_Shake`,
		location: { world: `Ward 13`, dungeon: "Quest" },
	},
	{
		category: "CONCOCTION",
		name: "Mudtooth's Elixir",
		imageUrl: "items/consumables/mudtoothselixir.png",
		internalSlug: "Consumable_MudToothsElixir_C",
		searchableTags: ["Consumable"],
		id: "yduuj3",
		dlc: "BASE",
		description: [
			"Increases Experience Gains by 15%.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Mudtooth's_Elixir`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: `Mudtooth's Snake Oil`,
		imageUrl: "items/consumables/mudtoothssnakeoil.png",
		internalSlug: "Consumable_MudtoothsSnakeOil_C",
		id: "ru74g9",
		dlc: "DLC3",
		searchableTags: ["Consumable"],
		description: [
			"Grants 1 random Concoction effect. Ignores concoction limit.",

			"Concoctions will stay in effect after death.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Mudtooth's_Snake_Oil`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: "Mudtooth's Stew",
		imageUrl: "items/consumables/mudtoothsstew.png",
		internalSlug: "Consumable_MudToothsStew_C",
		id: "5yrxf1",
		dlc: "BASE",
		searchableTags: ["Stamina", "Consumable"],
		description: [
			"Increases Max Stamina by 20.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Mudtooth's_Stew`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		modifiers: {
			stamina: 25,
		},
	},
	{
		category: "CONCOCTION",
		name: "Mudtooth's Tonic",
		imageUrl: "items/consumables/mudtoothstonic.png",
		internalSlug: "Consumable_MudToothsTonic_C",
		id: "p0ru94",
		dlc: "BASE",
		searchableTags: ["Health", "Consumable"],
		description: [
			"Increases Max Health by 20.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Mudtooth's_Tonic`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		modifiers: {
			health: 20,
		},
	},
	{
		category: "CONCOCTION",
		name: "Numbing Agent",
		imageUrl: "items/consumables/numbingagent.png",
		internalSlug: "Consumable_NumbingAgent_C",
		id: "d715ws",
		searchableTags: ["Grey Health", "Consumable"],
		description: [
			"Increases the hits that can be taken before losing Grey Health by 1. Lasts 60m and will stay in effect after death.",

			"Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Numbing_Agent`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		dlc: "DLC3",
	},
	{
		category: "CONCOCTION",
		name: "Root Water",
		imageUrl: "items/consumables/rootwater.png",
		internalSlug: "Consumable_RootWater_C",
		id: "56vkqr",
		dlc: "BASE",
		searchableTags: ["Heal", "Consumable"],
		description: [
			"Regenerates 1 Health per second.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Root_Water`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: "Sacred Lakewater",
		imageUrl: "items/consumables/sacredlakewater.png",
		internalSlug: "Consumable_SacredLakewater_C",
		id: "dk9yg4",
		dlc: "BASE",
		searchableTags: ["Grey Health", "Heal", "Consumable"],
		description: [
			"Increases Grey Health Conversion by 20% and Grey Health Regen by 2 per second.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Sacred_Lakewater`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: "Sanguine Vapor",
		imageUrl: "items/consumables/sanguinevapor.png",
		internalSlug: "Consumable_SanguineVapor_C",
		id: "kyulid",
		dlc: "BASE",
		searchableTags: ["Lifesteal", "Consumable"],
		description: [
			"Grants 2% of base damage dealt as Lifesteal.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Sanguine_Vapor`,
		location: {
			world: `Ward 13`,
			dungeon: "Vendor",
		},
	},
	{
		category: "CONCOCTION",
		name: "Strong Drink",
		imageUrl: "items/consumables/strongdrink.png",
		internalSlug: "Consumable_StrongDrink_C",
		id: "to2dcw",
		dlc: "BASE",
		searchableTags: ["Encumbrance", "Consumable"],
		description: [
			"Reduces Encumbrance by 10.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Strong_Drink`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		modifiers: {
			weight: -10,
		},
	},
	{
		category: "CONCOCTION",
		name: "Tranquility Font",
		imageUrl: "items/consumables/tranquilityfont.png",
		internalSlug: "Consumable_TranquilityFont_C",
		id: "l7r9sm",
		dlc: "BASE",
		searchableTags: ["Spread", "Recoil", "Consumable"],
		description: [
			"Reduces Reticle Sway, Spread, and Gun Recoil by 25%.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Tranquility_Font`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: "Verdant Tea",
		imageUrl: "items/consumables/verdanttea.png",
		internalSlug: "Consumable_VerdantTea_C",
		id: "qgare2",
		dlc: "BASE",
		searchableTags: ["Stamina", "Consumable"],
		description: [
			"Increases Stamina Recovery by 20 per second and reduces Stamina Regen Penalty by 50%.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Verdant_Tea`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
	{
		category: "CONCOCTION",
		name: "Xenoplasm",
		imageUrl: "items/consumables/xenoplasm.png",
		internalSlug: "Consumable_Xenoplasm_C",
		id: "2jeq07",
		dlc: "BASE",
		searchableTags: ["Reduce Skill Cooldown", "Consumable"],
		description: [
			"Reduces Skill Cooldowns 10%.",

			"Concoctions will stay in effect after death. Only one Concoction may be active at a time.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Xenoplasm`,
		location: { world: "Ward 13", dungeon: "Vendor" },
	},
];

export { CONCOCTIONS, type Remnant2ConcoctionItem };
