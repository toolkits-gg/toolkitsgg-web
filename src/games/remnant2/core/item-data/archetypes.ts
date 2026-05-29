import type { BaseRemnant2Item } from "#/games/remnant2/core/types";

type Remnant2ArchetypeItem = BaseRemnant2Item & {};

const ARCHETYPES: Remnant2ArchetypeItem[] = [
	{
		category: "ARCHETYPE",
		name: "Alchemist",
		imageUrl: "items/archetypes/alchemist.png",
		internalSlug: "Engram_Alchemist_C",
		id: "67pme7",
		dlc: "BASE",
		description: [
			"The ALCHEMIST specializes in powerful buffing Vials and consumable potency.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Alchemist`,
		location: { world: "Losomn", dungeon: ["Morrow Parish", "Ironborough"] },
		linkedItems: {
			traits: [
				{ name: "Potency", amount: 10 },
				{ name: "Spirit", amount: 2 },
				{ name: "Expertise", amount: 2 },
				{ name: "Vigor", amount: 1 },
			],
			skills: [
				{ name: "Vial: Stone Mist" },
				{ name: "Vial: Frenzy Dust" },
				{ name: "Vial: Elixir of Life" },
			],
			perks: [
				{ name: "Spirited" }, // * First perk should be prime perk
				{ name: "Liquid Courage" },
				{ name: "Panacea" },
				{ name: "Gold to Lead" },
				{ name: "Experimentalist" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Archon",
		imageUrl: "items/archetypes/archon.png",
		internalSlug: "Engram_Archon_C",
		id: "og1fvq",
		dlc: "BASE",
		description: [
			"The ARCHON is the master of Weapon Mods and Mod Power generation.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Archon`,
		location: { world: "The Backrooms", dungeon: "The Backrooms" },
		linkedItems: {
			traits: [
				{ name: "Flash Caster", amount: 10 },
				{ name: "Spirit", amount: 3 },
				{ name: "Vigor", amount: 1 },
				{ name: "Endurance", amount: 1 },
			],
			skills: [
				{ name: "Reality Rune" },
				{ name: "Chaos Gate" },
				{ name: "Havoc Form" },
			],
			perks: [
				{ name: "Tempest" }, // * First perk should be prime perk
				{ name: "Amplify" },
				{ name: "Power Creep" },
				{ name: "Spirit Within" },
				{ name: "Power Leak" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Challenger",
		imageUrl: "items/archetypes/challenger.png",
		internalSlug: "Engram_Challenger_C",
		id: "wm2xsy",
		dlc: "BASE",
		description: [
			"The CHALLENGER specializes in close range combat and heightened survivability.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Challenger`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		linkedItems: {
			traits: [
				{ name: "Strong Back", amount: 10 },
				{ name: "Vigor", amount: 3 },
				{ name: "Endurance", amount: 2 },
			],
			skills: [
				{ name: "War Stomp" },
				{ name: "Juggernaut" },
				{ name: "Rampage" },
			],
			perks: [
				{ name: "Die Hard" }, // * First perk should be prime perk
				{ name: "Close Quarters" },
				{ name: "Intimidating Presence" },
				{ name: "Powerlifter" },
				{ name: "Face of Danger" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Engineer",
		imageUrl: "items/archetypes/engineer.png",
		internalSlug: "Engram_Engineer_C",
		id: "98i1ka",
		dlc: "BASE",
		description: [
			"The ENGINEER specializes in Heavy Weaponry which can be carried or placed in turret mode.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Engineer`,
		location: {
			world: `N'Erud`,
			dungeon: ["Timeless Horizon", "The Eon Vault"],
		},
		linkedItems: {
			traits: [
				{ name: "Fortify", amount: 10 },
				{ name: "Vigor", amount: 2 },
				{ name: "Endurance", amount: 3 },
			],
			skills: [
				{ name: "Heavy Weapon: Vulcan" },
				{ name: "Heavy Weapon: Flamethrower" },
				{ name: "Heavy Weapon: Impact Cannon" },
			],
			perks: [
				{ name: "High Tech" }, // * First perk should be prime perk
				{ name: "Metalworker" },
				{ name: "Magnetic Field" },
				{ name: "Heavy Mobility" },
				{ name: "Surplus" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Explorer",
		imageUrl: "items/archetypes/explorer.png",
		internalSlug: "Engram_Explorer_C",
		id: "la3vvu",
		dlc: "BASE",
		description: [
			"The EXPLORER specializes in finding valuable items and overall team utility.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Explorer`,
		location: { world: "Root Earth", dungeon: ["Blackened Citadel"] },
		linkedItems: {
			traits: [
				{ name: "Swiftness", amount: 10 },
				{ name: "Endurance", amount: 2 },
				{ name: "Spirit", amount: 2 },
				{ name: "Expertise", amount: 1 },
			],
			skills: [
				{ name: "Plainswalker" },
				{ name: "Gold Digger" },
				{ name: "Fortune Hunter" },
			],
			perks: [
				{ name: "Lucky" }, // * First perk should be prime perk
				{ name: "Scavenger" },
				{ name: "Metal Detector" },
				{ name: "Prospector" },
				{ name: "Self Discovery" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Gunslinger",
		imageUrl: "items/archetypes/gunslinger.png",
		internalSlug: "Engram_Gunslinger_C",
		id: "d2qga5",
		dlc: "BASE",
		description: [
			"The GUNSLINGER specializes in raw damage, firearm handling, and ammo conservation.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Gunslinger`,
		location: { world: "Ward 13", dungeon: "Quest" },
		linkedItems: {
			traits: [
				{ name: "Ammo Reserves", amount: 10 },
				{ name: "Vigor", amount: 2 },
				{ name: "Expertise", amount: 2 },
				{ name: "Endurance", amount: 1 },
			],
			skills: [
				{ name: "Quick Draw" },
				{ name: "Sidewinder" },
				{ name: "Bulletstorm" },
			],
			perks: [
				{ name: "Loaded" }, // * First perk should be prime perk
				{ name: "Swift Shot" },
				{ name: "Posse Up" },
				{ name: "Quick Hands" },
				{ name: "Sleight of Hand" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Handler",
		imageUrl: "items/archetypes/handler.png",
		internalSlug: "Engram_Handler_C",
		id: "aazlxe",
		dlc: "BASE",
		description: [
			"The HANDLER specializes in teamwork in both solo and cooperative scenarios.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Handler`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		linkedItems: {
			traits: [
				{ name: "Kinship", amount: 10 },
				{ name: "Expertise", amount: 3 },
				{ name: "Vigor", amount: 1 },
				{ name: "Endurance", amount: 1 },
			],
			skills: [
				{ name: "Guard Dog" },
				{ name: "Support Dog" },
				{ name: "Attack Dog" },
			],
			perks: [
				{ name: "Bonded" }, // * First perk should be prime perk
				{ name: "Pack Hunter" },
				{ name: "Spirit of the Wolf" },
				{ name: "Teamwork" },
				{ name: "Best Friend" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Hunter",
		imageUrl: "items/archetypes/hunter.png",
		internalSlug: "Engram_Hunter_C",
		id: "5tkqdz",
		dlc: "BASE",
		description: [
			"The HUNTER specializes in ranged damage, precision shots and marking enemies.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Hunter`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		linkedItems: {
			traits: [
				{ name: "Longshot", amount: 10 },
				{ name: "Endurance", amount: 2 },
				{ name: "Expertise", amount: 2 },
				{ name: "Vigor", amount: 1 },
			],
			skills: [
				{ name: `Hunter's Mark` },
				{ name: `Hunter's Focus` },
				{ name: `Hunter's Shroud` },
			],
			perks: [
				{ name: "Dead to Rights" }, // * First perk should be prime perk
				{ name: "Deadeye" },
				{ name: "Return to Sender" },
				{ name: "Urgency" },
				{ name: "Intuition" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Invader",
		imageUrl: "items/archetypes/invader.png",
		internalSlug: "Engram_Invader_C",
		id: "0ipjpk",
		dlc: "BASE",
		description: [
			"The INVADER specializes elusiveness and misdirecting the enemy's focus.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Invader`,
		location: { world: "Root Earth", dungeon: ["Corrupted Harbor"] },
		linkedItems: {
			traits: [
				{ name: "Untouchable", amount: 10 },
				{ name: "Endurance", amount: 4 },
				{ name: "Spirit", amount: 1 },
			],
			skills: [
				{ name: "Void Cloak" },
				{ name: "Worm Hole" },
				{ name: "Reboot" },
			],
			perks: [
				{ name: "Shadow" }, // * First perk should be prime perk
				{ name: "S.H.A.R.K." },
				{ name: "Loophole" },
				{ name: "Circumvent" },
				{ name: "Override" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Invoker",
		imageUrl: "items/archetypes/invoker.png",
		internalSlug: "Engram_Invoker_C",
		id: "Y2NhrX",
		dlc: "DLC2",
		description: ["The INVOKER specializes in Skill Effectiveness and Buffs."],
		wikiUrl: "https://remnant2.wiki.gg/Invoker",
		location: { world: "Yaesha", dungeon: ["Ancient Canopy"] },
		linkedItems: {
			traits: [
				{ name: "Gifted", amount: 10 },
				{ name: "Vigor", amount: 2 },
				{ name: "Expertise", amount: 3 },
			],
			skills: [
				{ name: "Way of Kaeula" },
				{ name: "Way of Meidra" },
				{ name: "Way of Lydusa" },
			],
			perks: [
				{ name: "Visionary" },
				{ name: "Entranced" },
				{ name: "Communion" },
				{ name: "Mind and Body" },
				{ name: "Soothsayer" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Medic",
		imageUrl: "items/archetypes/medic.png",
		internalSlug: "Engram_Medic_C",
		id: "d6fvmc",
		dlc: "BASE",
		description: [
			"The MEDIC specializes in survivability with enhanced healing and Relic effectiveness.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Medic`,
		location: { world: "Ward 13", dungeon: "Vendor" },
		linkedItems: {
			traits: [
				{ name: "Triage", amount: 10 },
				{ name: "Vigor", amount: 2 },
				{ name: "Expertise", amount: 2 },
				{ name: "Spirit", amount: 1 },
			],
			skills: [
				{ name: "Wellspring" },
				{ name: "Healing Shield" },
				{ name: "Redemption" },
			],
			perks: [
				{ name: "Regenerator" }, // * First perk should be prime perk
				{ name: "Invigorated" },
				{ name: "Benevolence" },
				{ name: "Backbone" },
				{ name: "Benefactor" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Ritualist",
		imageUrl: "items/archetypes/ritualist.png",
		internalSlug: "Engram_Ritualist_C",
		id: "1q7z9d",
		dlc: "DLC1",
		description: [
			"The RITUALIST is a powerful class focusing on status effects and AOE damage, that can make enemies infect their allies with whatever status they are suffering",
		],
		wikiUrl: `https://remnant2.wiki.gg/Ritualist`,
		location: { world: "Losomn", dungeon: ["Forlorn Coast"] },
		linkedItems: {
			traits: [
				{ name: "Affliction", amount: 10 },
				{ name: "Spirit", amount: 3 },
				{ name: "Expertise", amount: 2 },
			],
			skills: [{ name: "Eruption" }, { name: "Miasma" }, { name: "Deathwish" }],
			perks: [
				{ name: "Vile" }, // * First perk should be prime perk
				{ name: "Wrath" },
				{ name: "Terrify" },
				{ name: "Dark Blood" },
				{ name: "Purge" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Summoner",
		imageUrl: "items/archetypes/summoner.png",
		internalSlug: "Engram_Summoner_C",
		id: "og0bwx",
		dlc: "BASE",
		description: [
			"The SUMMONER specializes in using Minions to do their bidding and sacrificing them.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Summoner`,
		location: { world: `Yaesha`, dungeon: "Vendor" },
		linkedItems: {
			traits: [
				{ name: "Regrowth", amount: 10 },
				{ name: "Spirit", amount: 3 },
				{ name: "Vigor", amount: 1 },
				{ name: "Expertise", amount: 1 },
			],
			skills: [
				{ name: "Minion: Hollow" },
				{ name: "Minion: Flyer" },
				{ name: "Minion: Reaver" },
			],
			perks: [
				{ name: "Ruthless" },
				{ name: "Dominator" },
				{ name: "Residue" },
				{ name: "Outrage" },
				{ name: "Incite" },
			],
		},
	},
	{
		category: "ARCHETYPE",
		name: "Warden",
		imageUrl: "items/archetypes/warden.png",
		internalSlug: "Engram_Warden_C",
		id: "tn0x3c",
		dlc: "DLC3",
		communityTags: [],
		description: [
			"The Warden is an unlockable Archetype. They make use of a powerful N'Erud drone to empower themselves and their allies.",
		],
		wikiUrl: `https://remnant2.wiki.gg/Warden`,
		location: { world: `N'Erud`, dungeon: ["Withered Necropolis"] },
		linkedItems: {
			traits: [
				{ name: "Barrier", amount: 10 },
				{ name: "Expertise", amount: 2 },
				{ name: "Endurance", amount: 1 },
				{ name: "Spirit", amount: 2 },
			],
			skills: [
				{ name: "Drone: Shield" },
				{ name: "Drone: Heal" },
				{ name: "Drone: Combat" },
			],
			perks: [
				{ name: "Dynamic" },
				{ name: "Warden Damage Perk" },
				{ name: "Warden Team Perk" },
				{ name: "Warden Utility Perk" },
				{ name: "Warden Relic Perk" },
			],
		},
	},
];

export { ARCHETYPES, type Remnant2ArchetypeItem };
