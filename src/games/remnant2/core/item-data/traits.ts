import type { BaseRemnant2Item } from "#/games/remnant2/core/types";

type TraitItemModifiers = {
	armor: number;
	armorPercentage: number;
	armorThreshold: number;
	elementalResistance: number;
	elementalResistancePercentage: number;
	elementalResistanceThreshold: number;
	health: number;
	healthPercentage: number;
	healthThreshold: number;
	stamina: number;
	staminaPercentage: number;
	staminaThreshold: number;
	shield: number;
	shieldPercentage: number;
	shieldThreshold: number;
	weight: number;
	weightPercentage: number;
	weightThreshold: number;
};

type Remnant2TraitItem = BaseRemnant2Item<"archetype" | "core" | "trait"> & {
	traitModifiers?: Partial<TraitItemModifiers>;
};

const TRAITS: Remnant2TraitItem[] = [
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Affliction",
		imageUrl: "items/traits/affliction.png",
		internalSlug: "Trait_Affliction_C",
		id: "dj8zx4",
		dlc: "DLC1",
		searchableTags: ["Status Effect", "Status Duration"],
		description: [
			"Increases STATUS EFFECT duration against enemies by 10 -> 100%.",
			"RITUALIST Archetype Trait",
		],
		wikiUrl: "https://remnant2.wiki.gg/Affliction",
		linkedItems: {
			archetype: {
				name: "Ritualist",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Ammo Reserves",
		imageUrl: "items/traits/ammoreserves.png",
		internalSlug: "Trait_AmmoReserves_C",
		id: "wu3w8t",
		dlc: "BASE",
		searchableTags: ["Ammo Reserves"],
		description: [
			"Increases Ammo Reserves by 5% -> 50%.",
			"GUNSLINGER Archetype Trait",
		],
		wikiUrl: "https://remnant2.wiki.gg/Ammo_Reserves",
		location: { world: "Any", dungeon: "Linked Item" },
		linkedItems: {
			archetype: {
				name: "Gunslinger",
			},
		},
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Barrier",
		imageUrl: "items/traits/barrier.png",
		internalSlug: "Trait_Barrier_C",
		id: "9c311c",
		dlc: "DLC3",
		searchableTags: [],
		communityTags: [],
		description: ["Increases SHIELD amount by 1.5% -> 15%."],
		wikiUrl: "https://remnant2.wiki.gg/Barrier",
		location: { world: `N'Erud`, dungeon: "Linked Item" },
		linkedItems: {
			archetype: {
				name: "Warden",
			},
		},
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Flash Caster",
		imageUrl: "items/traits/flashcaster.png",
		internalSlug: "Trait_FlashCaster_C",
		id: "m6i4dl",
		dlc: "BASE",
		searchableTags: ["Mod Cast Speed", "Skill Cast Speed"],
		description: [
			"Increases Mod and Skill Casting Speed by 5 -> 50%.",
			"ARCHON Archetype Trait.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Flash_Caster",
		linkedItems: {
			archetype: {
				name: "Archon",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Fortify",
		imageUrl: "items/traits/fortify.png",
		internalSlug: "Trait_Fortify_C",
		id: "osj7se",
		dlc: "BASE",
		searchableTags: ["Armor Increase", "Damage Reduction"],
		description: [
			"Increases Armor Effectiveness by 5% -> 50%.",
			"ENGINEER Archetype Trait",
		],
		wikiUrl: "https://remnant2.wiki.gg/Fortify",
		linkedItems: {
			archetype: {
				name: "Engineer",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
		modifiers: { armorStepPercentage: 0.05 },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Gifted",
		imageUrl: "items/traits/gifted.png",
		internalSlug: "Trait_Gifted_C",
		id: "c9af3B",
		dlc: "DLC2",
		searchableTags: ["Skill Duration"],
		description: [
			"Increases Skill Duration by 30%.",
			"INVOKER Archetype Trait",
		],
		wikiUrl: "https://remnant2.wiki.gg/Gifted",
		linkedItems: {
			archetype: {
				name: "Invoker",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Kinship",
		imageUrl: "items/traits/kinship.png",
		internalSlug: "Trait_Kinship_C",
		id: "vn3gsg",
		dlc: "BASE",
		searchableTags: ["Damage Reduction"],
		description: [
			"Reduces Friendly Fire Damage Dealt and Received by 8% -> 80%.",
			"HANDLER Archetype Trait.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Kinship",
		linkedItems: {
			archetype: {
				name: "Handler",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Longshot",
		imageUrl: "items/traits/longshot.png",
		internalSlug: "Trait_Longshot_C",
		id: "157qcj",
		dlc: "BASE",
		searchableTags: ["Range"],
		description: [
			"Increases Weapon Ideal Range by 0.6m -> 6m.",
			"HUNTER Archetype Trait",
		],
		wikiUrl: "https://remnant2.wiki.gg/Longshot",
		linkedItems: {
			archetype: {
				name: "Hunter",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Potency",
		imageUrl: "items/traits/potency.png",
		internalSlug: "Trait_Potency_C",
		id: "v1uiyd",
		dlc: "BASE",
		searchableTags: ["Concoction"],
		description: [
			"Increases Consumable Duration by 10% -> 100%.",
			"ALCHEMIST Archetype Trait.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Potency",
		linkedItems: {
			archetype: {
				name: "Alchemist",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Regrowth",
		imageUrl: "items/traits/regrowth.png",
		internalSlug: "Trait_Regrowth_C",
		id: "ysp1wu",
		dlc: "BASE",
		searchableTags: ["Health"],
		description: [
			"Increases Health Regeneration by 0.15/s -> 1.5/s.",
			"SUMMONER Archetype Trait",
		],
		wikiUrl: "https://remnant2.wiki.gg/Regrowth",
		linkedItems: {
			archetype: {
				name: "Summoner",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Swiftness",
		imageUrl: "items/traits/swiftness.png",
		internalSlug: "Trait_Swiftness_C",
		id: "3ochlm",
		dlc: "BASE",
		searchableTags: ["Movement Speed"],
		description: [
			"Increases Movement Speed by 1% -> 15%.",
			"Increases Environmental Movement Speed by 5% - 50%.",
			"(Vaulting, Ladders, Wading)",
			"EXPLORER Archetype Trait.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Swiftness",
		linkedItems: {
			archetype: {
				name: "Explorer",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Strong Back",
		imageUrl: "items/traits/strongback.png",
		internalSlug: "Trait_StrongBack_C",
		id: "sd2hry",
		dlc: "BASE",
		searchableTags: ["Neutral Dodge", "Perfect Dodge", "Perfect Neutral Evade"],
		description: [
			"Increases Dodge Weight Threshold by 1.5 -> 15.",
			"CHALLENGER Archetype Trait",
		],
		wikiUrl: "https://remnant2.wiki.gg/Strong_Back",
		linkedItems: {
			archetype: {
				name: "Challenger",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
		modifiers: {
			weightThresholds: [1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5, 15],
		},
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Triage",
		imageUrl: "items/traits/triage.png",
		internalSlug: "Trait_Triage_C",
		id: "pbak5a",
		dlc: "BASE",
		searchableTags: ["Heal", "Healing Effectiveness"],
		description: ["Increases Healing by 5% -> 50%.", "MEDIC Archetype Trait"],
		wikiUrl: "https://remnant2.wiki.gg/Triage",
		linkedItems: {
			archetype: {
				name: "Medic",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "archetype",
		name: "Untouchable",
		imageUrl: "items/traits/untouchable.png",
		internalSlug: "Trait_Untouchable_C",
		id: "pkmmg6",
		dlc: "BASE",
		searchableTags: ["Neutral Dodge", "Perfect Dodge", "Perfect Neutral Evade"],
		description: [
			"Increases Evade Window by 3% -> 30%.",
			"INVADER Archetype Trait",
		],
		wikiUrl: "https://remnant2.wiki.gg/Untouchable",
		linkedItems: {
			archetype: {
				name: "Invader",
			},
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "core",
		name: "Vigor",
		imageUrl: "items/traits/vigor.png",
		internalSlug: "Trait_Vigor_C",
		id: "o6mx2t",
		dlc: "BASE",
		searchableTags: ["Health"],
		description: ["Increases Max Health by 3 -> 30."],
		wikiUrl: "https://remnant2.wiki.gg/Vigor",
		modifiers: {
			healthStep: 3,
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "core",
		name: "Spirit",
		imageUrl: "items/traits/spirit.png",
		internalSlug: "Trait_Spirit_C",
		id: "p4b2v6",
		dlc: "BASE",
		searchableTags: ["Mod Power"],
		description: ["Increases Mod Power Generation by 2% -> 20%."],
		wikiUrl: "https://remnant2.wiki.gg/Spirit",

		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "core",
		name: "Endurance",
		imageUrl: "items/traits/endurance.png",
		internalSlug: "Trait_Endurance_C",
		id: "wgzz0q",
		dlc: "BASE",
		searchableTags: ["Stamina"],
		description: ["Increases Max Stamina by 3 -> 30."],
		wikiUrl: "https://remnant2.wiki.gg/Endurance",

		modifiers: {
			staminaStep: 3,
		},
		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "core",
		name: "Expertise",
		imageUrl: "items/traits/expertise.png",
		internalSlug: "Trait_Expertise_C",
		id: "6kxk5x",
		dlc: "BASE",
		searchableTags: ["Reduce Skill Cooldown"],
		description: ["Reduces Skill Cooldowns by 2% -> 20%."],
		wikiUrl: "https://remnant2.wiki.gg/Expertise",

		location: { world: "Any", dungeon: "Linked Item" },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Scholar",
		imageUrl: "items/traits/scholar.png",
		internalSlug: "Trait_Scholar_C",
		id: "6j7cn1",
		dlc: "BASE",
		description: ["Increases Experience Gain by 1 -> 15%."],
		wikiUrl: "https://remnant2.wiki.gg/Scholar",

		location: { world: "Root Earth", dungeon: ["Blackened Citadel"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Amplitude",
		imageUrl: "items/traits/amplitude.png",
		internalSlug: "Trait_Amplitude_C",
		id: "pb5neu",
		dlc: "BASE",
		description: ["Increases AOE and AURA Size by 5 -> 50%."],
		wikiUrl: "https://remnant2.wiki.gg/Amplitude",
		location: { world: "Labyrinth", dungeon: ["Colosseum of Ruin"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Arcane Strike",
		imageUrl: "items/traits/arcanestrike.png",
		internalSlug: "Trait_ArcaneStrike_C",
		id: "6o5ckl",
		dlc: "BASE",
		searchableTags: ["Mod Power", "Melee Damage"],
		description: [
			"Increases Mod Power Generation from Melee Damage by 5 -> 50%.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Arcane_Strike",
		location: { world: "Losomn", dungeon: [`Harvester's Reach`] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Barkskin",
		imageUrl: "items/traits/barkskin.png",
		internalSlug: "Trait_Barkskin_C",
		id: "2vgobq",
		dlc: "BASE",
		searchableTags: ["Damage Reduction"],
		description: ["Reduces all incoming damage by 1 -> 10%."],
		wikiUrl: "https://remnant2.wiki.gg/Barkskin",

		location: {
			world: "Yaesha",
			biome: "Jungles of Yaesha",
			injectable: "Dappled Glade",
		},
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Blood Bond",
		imageUrl: "items/traits/bloodbond.png",
		internalSlug: "Trait_BloodBond_C",
		id: "1ke6u2",
		dlc: "BASE",
		searchableTags: ["Summon", "Damage Reduction"],
		description: [
			"Summoner Minions absorb 1 -> 10% of damage taken by the caster.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Blood_Bond",

		location: {
			world: "Yaesha",
			biome: "Jungles of Yaesha",
			injectable: "Root Nexus",
		},
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Bloodstream",
		imageUrl: "items/traits/bloodstream.png",
		internalSlug: "Trait_Bloodstream_C",
		id: "yvttbq",
		dlc: "BASE",
		searchableTags: ["Grey Health"],
		description: ["Increases Grey Health Regeneration by 0.3/s -> 3/s."],
		wikiUrl: "https://remnant2.wiki.gg/Bloodstream",

		location: {
			world: "Yaesha",
			biome: "Jungles of Yaesha",
			injectable: "Dappled Glade",
		},
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Chakra",
		imageUrl: "items/traits/chakra.png",
		internalSlug: "Trait_Chakra_C",
		dlc: "BASE",
		id: "k8sebP",
		searchableTags: ["Mod Duration"],
		description: ["Increases Mod Duration by 3 -> 30%."],
		wikiUrl: "https://remnant2.wiki.gg/Chakra",

		location: { world: "Root Earth", dungeon: ["Corrupted Harbor"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Dark Pact",
		imageUrl: "items/traits/darkpact.png",
		internalSlug: "Trait_DarkPact_C",
		id: "mjkf4t",
		dlc: "DLC1",
		searchableTags: ["Grey Health"],
		description: ["Increases Grey Health Conversion Rate by 3 -> 30%."],
		wikiUrl: "https://remnant2.wiki.gg/Dark_Pact",

		location: { world: "Losomn", dungeon: ["Forlorn Coast"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Fitness",
		imageUrl: "items/traits/fitness.png",
		internalSlug: "Trait_Fitness_C",
		id: "qcvmt0",
		dlc: "BASE",
		searchableTags: ["Neutral Dodge", "Perfect Dodge", "Perfect Neutral Evade"],
		description: ["Increases Evade Distance by 3 -> 30%."],
		wikiUrl: "https://remnant2.wiki.gg/Fitness",

		location: { world: `N'Erud`, dungeon: ["Vault of the Formless"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Footwork",
		imageUrl: "items/traits/footwork.png",
		internalSlug: "Trait_Footwork_C",
		id: "ay1dkh",
		dlc: "BASE",
		searchableTags: ["Movement Speed"],
		description: ["Increases Movement Speed while Aiming by 5 -> 50%."],
		wikiUrl: "https://remnant2.wiki.gg/Footwork",

		location: { world: `N'Erud`, dungeon: [`Terminus Station`] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Glutton",
		imageUrl: "items/traits/glutton.png",
		internalSlug: "Trait_Glutton_C",
		id: "cvsois",
		dlc: "BASE",
		searchableTags: ["Relic Use Speed"],
		description: [
			"Increases the Use Speed of Consumables and Relics by 3.5% -> 35%.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Glutton",

		location: { world: "Losomn", dungeon: ["The Great Hall"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Handling",
		imageUrl: "items/traits/handling.png",
		internalSlug: "Trait_Handling_C",
		id: "8baa52",
		dlc: "BASE",
		searchableTags: ["Spread", "Recoil"],
		description: ["Reduces Weapon Spread and Recoil by 3% -> 30%."],
		wikiUrl: "https://remnant2.wiki.gg/Handling",

		location: { world: "Root Earth", dungeon: ["Ashen Wasteland"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Insight",
		imageUrl: "items/traits/insight1.png",
		internalSlug: "Trait_Insight_C",
		id: "3kbtu8",
		dlc: "DLC3",
		searchableTags: ["Mod Power"],
		description: ["Automatically generate 1 Mod Power per second."],
		wikiUrl: "https://remnant2.wiki.gg/Insight",

		location: { world: `N'Erud`, dungeon: "Quest" },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Leech",
		imageUrl: "items/traits/leech.png",
		internalSlug: "Trait_Leech_C",
		id: "o6mx3t",
		dlc: "BASE",
		searchableTags: ["Lifesteal"],
		description: ["Increases Lifesteal Efficacy by 5 -> 50%."],
		wikiUrl: "https://remnant2.wiki.gg/Leech",

		location: { world: `N'Erud`, dungeon: [`Dormant N'Erudian Facility`] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Perception",
		imageUrl: "items/traits/perception.png",
		internalSlug: "Trait_Perception_C",
		id: "7pxnhi",
		dlc: "DLC3",
		searchableTags: [],
		description: ["Increases HASTE by 0.3 -> 3% and SLOW by 1 -> 10%."],
		wikiUrl: "https://remnant2.wiki.gg/Perception",

		location: { world: `N'Erud`, dungeon: ["Stagnant Manufactory"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Preservation",
		imageUrl: "items/traits/preservation.png",
		internalSlug: "Trait_Preservation_C",
		id: "gq7w6z",
		dlc: "DLC3",
		searchableTags: [],
		description: ["Increases SHIELD Duration Received 3 -> 30%."],
		wikiUrl: "https://remnant2.wiki.gg/Preservation",

		modifiers: {
			shieldStepPercentage: 3,
		},

		location: {
			world: `N'Erud`,
			dungeon: ["Agronomy Sector", "Withered Necropolis"],
		},
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Recovery",
		imageUrl: "items/traits/recovery.png",
		internalSlug: "Trait_Recovery_C",
		id: "7z3ejv",
		dlc: "BASE",
		searchableTags: ["Stamina"],
		description: ["Increases Stamina Regen by 3 -> 30/s."],
		wikiUrl: "https://remnant2.wiki.gg/Recovery",

		location: {
			world: "Losomn",
			biome: "Streets of Losomn",
			injectable: `Oracle's Refuge`,
		},
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Resolute",
		imageUrl: "items/traits/resolute.png",
		internalSlug: "Trait_Resolute_C",
		id: "7z3ejd",
		dlc: "DLC2",
		searchableTags: ["Stagger"],
		description: ["Reduces Hit Reaction Time by 2.5% -> 25%."],
		wikiUrl: "https://remnant2.wiki.gg/Resolute",

		location: { world: "Yaesha", dungeon: "Quest" },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Revivalist",
		imageUrl: "items/traits/revivalist.png",
		internalSlug: "Trait_Revivalist_C",
		id: "a4idgl",
		dlc: "BASE",
		description: [
			"Increases the speed of Reviving and being Revived by 5 -> 50%.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Revivalist",

		location: { world: "Any", dungeon: "Quest" },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Rugged",
		imageUrl: "items/traits/rugged.png",
		internalSlug: "Trait_Rugged_C",
		id: "ykxzf1",
		dlc: "BASE",
		searchableTags: ["Summon"],
		description: [
			"Increases the Health of Archetype Summons by a 10 -> 100% .",
		],
		wikiUrl: "https://remnant2.wiki.gg/Rugged",

		location: { world: "Yaesha", dungeon: ["Forgotten Field"] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Shadeskin",
		imageUrl: "items/traits/shadeskin.png",
		internalSlug: "Trait_Shadeskin_C",
		id: "jk0ot9",
		dlc: "BASE",
		searchableTags: ["Damage Reduction"],
		description: ["Increases Elemental Damage Resistance by 2 -> 20%."],
		wikiUrl: "https://remnant2.wiki.gg/Shadeskin",
		modifiers: {
			// Increases by 2% per level, but since 10 fire resistance is 10%
			// we add the percentage
			elementalResistanceStep: 2,
		},

		location: { world: "Losomn", dungeon: [`Butcher's Quarter`] },
	},
	{
		category: "TRAIT",
		subcategory: "trait",
		name: "Siphoner",
		imageUrl: "items/traits/siphoner.png",
		internalSlug: "Trait_Siphoner_C",
		id: "x9umnf",
		dlc: "BASE",
		searchableTags: ["Lifesteal"],
		description: ["Grants 0.3 -> 3.0% base damage as Lifesteal."],
		wikiUrl: "https://remnant2.wiki.gg/Siphoner",

		location: { world: `N'Erud`, dungeon: [`Dormant N'Erudian Facility`] },
	},
];

export { type Remnant2TraitItem, TRAITS };
