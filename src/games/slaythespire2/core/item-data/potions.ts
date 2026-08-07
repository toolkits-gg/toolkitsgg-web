import type { BaseSlayTheSpire2Item } from "#/games/slaythespire2/core/types";
import type { SlayTheSpire2PotionRarity } from "@/prisma";

type SlayTheSpire2PotionItem = BaseSlayTheSpire2Item & {
	rarity: SlayTheSpire2PotionRarity;
};

const POTIONS: SlayTheSpire2PotionItem[] = [
	// #region COMMON
	{
		name: "Attack Potion",
		category: "POTION",
		id: "ip18f",
		dlc: "BASE",
		description: [
			`Choose 1 of 3 random Attack cards to add into your Hand. It's free to play this turn.`,
		],
		imageUrl: "potions/attack_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: undefined,
	},
	{
		name: "Block Potion",
		category: "POTION",
		id: "2wmy9",
		dlc: "BASE",
		description: [`Gain 12 Block.`],
		imageUrl: "potions/block_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					block: 12,
				},
				trigger: "combat",
			},
		],
	},
	{
		name: "Colorless Potion",
		category: "POTION",
		id: "8cxcj",
		dlc: "BASE",
		description: [
			`Choose 1 of 3 random Colorless cards to add into your Hand. It's free to play this turn.`,
		],
		imageUrl: "potions/colorless_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: undefined,
	},
	{
		name: "Dexterity Potion",
		category: "POTION",
		id: "hmy0d",
		dlc: "BASE",
		description: [`Gain 2 Dexterity.`],
		imageUrl: "potions/dexterity_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					dexterity: 2,
				},
				trigger: "combat",
			},
		],
	},
	{
		name: "Energy Potion",
		category: "POTION",
		id: "v7gvm",
		dlc: "BASE",
		description: [`Gain 2 Energy.`],
		imageUrl: "potions/energy_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					energy: 2,
				},
				trigger: "combat",
			},
		],
	},
	{
		name: "Explosive Ampoule",
		category: "POTION",
		id: "sbx5h",
		dlc: "BASE",
		description: [`Deal 10 damage to ALL enemies.`],
		imageUrl: "potions/explosive_ampoule.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					damage: 10,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Fire Potion",
		category: "POTION",
		id: "ta1gz",
		dlc: "BASE",
		description: [`Deal 20 damage.`],
		imageUrl: "potions/fire_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					damage: 20,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Flex Potion",
		category: "POTION",
		id: "g2dc3",
		dlc: "BASE",
		description: [`Gain 5 Strength. At the end of your turn, lose 5 Strength.`],
		imageUrl: "potions/flex_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					strength: 5,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Power Potion",
		category: "POTION",
		id: "b6zx5",
		dlc: "BASE",
		description: [
			`Choose 1 of 3 random Power cards to add into your Hand. It's free to play this turn.`,
		],
		imageUrl: "potions/power_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: undefined,
	},
	{
		name: "Skill Potion",
		category: "POTION",
		id: "8xiv6",
		dlc: "BASE",
		description: [
			`Choose 1 of 3 random Skill cards to add into your Hand. It's free to play this turn.`,
		],
		imageUrl: "potions/skill_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: undefined,
	},
	{
		name: "Speed Potion",
		category: "POTION",
		id: "2he5l",
		dlc: "BASE",
		description: [
			`Gain 5 Dexterity. At the end of your turn, lose 5 Dexterity.`,
		],
		imageUrl: "potions/speed_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					dexterity: 5,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Strength Potion",
		category: "POTION",
		id: "4ov5r",
		dlc: "BASE",
		description: [`Gain 2 Strength.`],
		imageUrl: "potions/strength_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					strength: 2,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Swift Potion",
		category: "POTION",
		id: "obs9a",
		dlc: "BASE",
		description: [`Draw 3 cards.`],
		imageUrl: "potions/swift_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					draw: 3,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Vulnerable Potion",
		category: "POTION",
		id: "dy8fm",
		dlc: "BASE",
		description: [`Apply 3 Vulnerable.`],
		imageUrl: "potions/vulnerable_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					vulnerable: 3,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Weak Potion",
		category: "POTION",
		id: "q9559",
		dlc: "BASE",
		description: [`Apply 3 Weak.`],
		imageUrl: "potions/weak_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		modifiers: [
			{
				modifier: {
					weak: 3,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Blood Potion",
		category: "POTION",
		id: "9s1n7",
		dlc: "BASE",
		description: [`Heal for 20% of your Max HP.`],
		imageUrl: "potions/blood_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		linkedItems: {
			character: { name: "IRONCLAD" },
		},
		modifiers: undefined,
	},
	{
		name: "Poison Potion",
		category: "POTION",
		id: "rkjj7",
		dlc: "BASE",
		description: [`Apply 6 Poison.`],
		imageUrl: "potions/poison_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		linkedItems: { character: { name: "SILENT" } },
		modifiers: [
			{
				modifier: {
					poison: 6,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Star Potion",
		category: "POTION",
		id: "qrda6",
		dlc: "BASE",
		description: [`Gain 3 Stars`],
		imageUrl: "potions/star_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		linkedItems: { character: { name: "REGENT" } },
		modifiers: [
			{
				modifier: {
					focus: 2,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Potion of Doom",
		category: "POTION",
		id: "xh1sj",
		dlc: "BASE",
		description: [`Apply 33 Doom.`],
		imageUrl: "potions/potion_of_doom.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		linkedItems: { character: { name: "NECROBINDER" } },
		modifiers: [
			{
				modifier: {
					doom: 33,
				},
				trigger: "combat",
			},
		],
	},
	{
		name: "Focus Potion",
		category: "POTION",
		id: "28kp4",
		dlc: "BASE",
		description: [`Gain 2 Focus.`],
		imageUrl: "potions/focus_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "COMMON",
		linkedItems: { character: { name: "DEFECT" } },
		modifiers: [
			{
				modifier: {
					focus: 2,
				},
				trigger: 1,
			},
		],
	},

	// #region UNCOMMON

	{
		name: "Blessing of the Forge",
		category: "POTION",
		id: "v1bkr",
		dlc: "BASE",
		description: [`Upgrade all cards in your Hand for the rest of combat.`],
		imageUrl: "potions/blessing_of_the_forge.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: undefined,
	},
	{
		name: "Clarity Extract",
		category: "POTION",
		id: "4losf",
		dlc: "BASE",
		description: [
			`Draw 1 card. At the start of your next 3 turns, draw 1 additional card.`,
		],
		imageUrl: "potions/clarity.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					draw: 1,
				},
				trigger: 1,
			},
			{
				modifier: {
					draw: 1,
				},
				trigger: 3,
			},
		],
	},
	{
		name: "Cure All",
		category: "POTION",
		id: "h18y0",
		dlc: "BASE",
		description: [`Gain 1 Energy. Draw 2 cards.`],
		imageUrl: "potions/cure_all.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					energy: 1,
					draw: 2,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Duplicator",
		category: "POTION",
		id: "w3xyt",
		dlc: "BASE",
		description: [`This turn, your next card is played an extra time.`],
		imageUrl: "potions/duplicator.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: undefined,
	},
	{
		name: "Fortifier",
		category: "POTION",
		id: "2w6xc",
		dlc: "BASE",
		description: [`Triple your Block.`],
		imageUrl: "potions/fortifier.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					blockX: 3,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Fysh Oil",
		category: "POTION",
		id: "k697k",
		dlc: "BASE",
		description: [`Gain 1 Strength and 1 Dexterity.`],
		imageUrl: "potions/fysh_oil.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					strength: 1,
					dexterity: 1,
				},
				trigger: "combat",
			},
		],
	},
	{
		name: `Gambler's Brew`,
		category: "POTION",
		id: "kqrq3",
		dlc: "BASE",
		description: [`Discard any number of cards, then draw that many.`],
		imageUrl: "potions/gamblers_brew.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: undefined,
	},
	{
		name: "Heart of Iron",
		category: "POTION",
		id: "qco2p",
		dlc: "BASE",
		description: [`Gain 7 Plating.`],
		imageUrl: "potions/heart_of_iron.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					plating: 7,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Liquid Bronze",
		category: "POTION",
		id: "ghts9",
		dlc: "BASE",
		description: [`Gain 3 Thorns.`],
		imageUrl: "potions/liquid_bronze.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					thorns: 3,
				},
				trigger: "combat",
			},
		],
	},
	{
		name: "Potion of Binding",
		category: "POTION",
		id: "tg2ul",
		dlc: "BASE",
		description: [`Apply 1 Weak and 1 Vulnerable to ALL enemies.`],
		imageUrl: "potions/potion_of_binding.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					weak: 1,
					vulnerable: 1,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Powdered Demise",
		category: "POTION",
		id: "afx5s",
		dlc: "BASE",
		description: [`Enemy loses 9 HP at the end of each of its turns.`],
		imageUrl: "potions/powdered_demise.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					enemyHealth: -9,
				},
				trigger: "each turn",
			},
		],
	},
	{
		name: "Radiant Tincture",
		category: "POTION",
		id: "qm3p7",
		dlc: "BASE",
		description: [
			`Gain 1 Energy. Gain an additional 1 Energy at the start of your next 3 turns.`,
		],
		imageUrl: "potions/radiant_tincture.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					energy: 1,
				},
				trigger: 1,
			},
			{
				modifier: {
					energy: 1,
				},
				trigger: 3,
			},
		],
	},
	{
		name: "Regen Potion",
		category: "POTION",
		id: "qino8",
		dlc: "BASE",
		description: [`Gain 5 Regen.`],
		imageUrl: "potions/regen_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					heal: 5,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Stable Serum",
		category: "POTION",
		id: "f6lff",
		dlc: "BASE",
		description: [`Retain your Hand for 2 turns.`],
		imageUrl: "potions/stable_serum.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: [
			{
				modifier: {
					retainHand: true,
				},
				trigger: 2,
			},
		],
	},
	{
		name: "Touch of Insanity",
		category: "POTION",
		id: "9b8k9",
		dlc: "BASE",
		description: [
			`Choose a card in your Hand. It is free to play this combat.`,
		],
		imageUrl: "potions/touch_of_insanity.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",

		modifiers: undefined,
	},
	{
		name: "Ashwater",
		category: "POTION",
		id: "itl2s",
		dlc: "BASE",
		description: [`Exhaust any number of cards in your Hand.`],
		imageUrl: "potions/ashwater.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",
		linkedItems: { character: { name: "IRONCLAD" } },
		modifiers: undefined,
	},
	{
		name: "Cunning Potion",
		category: "POTION",
		id: "vk483",
		dlc: "BASE",
		description: [`Add 3 Upgraded Shivs into your Hand.`],
		imageUrl: "potions/cunning_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",
		linkedItems: { character: { name: "SILENT" } },
		modifiers: undefined,
	},
	{
		name: `King's Courage`,
		category: "POTION",
		id: "hu0i3",
		dlc: "BASE",
		description: [`Forge 15.`],
		imageUrl: "potions/kings_courage.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",
		linkedItems: { character: { name: "REGENT" } },
		modifiers: undefined,
	},
	{
		name: "Bone Brew",
		category: "POTION",
		id: "2tutf",
		dlc: "BASE",
		description: [`Summon 15.`],
		imageUrl: "potions/bone_brew.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",
		linkedItems: { character: { name: "NECROBINDER" } },
		modifiers: undefined,
	},
	{
		name: "Potion of Capacity",
		category: "POTION",
		id: "k4luu",
		dlc: "BASE",
		description: [`Gain 2 Orb Slots.`],
		imageUrl: "potions/potion_of_capacity.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "UNCOMMON",
		linkedItems: { character: { name: "DEFECT" } },
		modifiers: undefined,
	},

	// #region RARE
	{
		name: "Beetle Juice",
		category: "POTION",
		id: "ud1bj",
		dlc: "BASE",
		description: [`Enemy's attacks deal 30% less damage for the next 4 turns.`],
		imageUrl: "potions/beetle_juice.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: [
			{
				modifier: {
					enemyDamageX: 0.3,
				},
				trigger: 4,
			},
		],
	},
	{
		name: "Bottled Potential",
		category: "POTION",
		id: "zg2f5",
		dlc: "BASE",
		description: [`Shuffle ALL your cards into your Draw Pile. Draw 5 cards.`],
		imageUrl: "potions/bottled_potential.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: [
			{
				modifier: {
					draw: 5,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Distilled Chaos",
		category: "POTION",
		id: "do9fb",
		dlc: "BASE",
		description: [`Play the top 3 cards of your Draw Pile.`],
		imageUrl: "potions/distilled_chaos.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: undefined,
	},
	{
		name: "Droplet of Precognition",
		category: "POTION",
		id: "7l275",
		dlc: "BASE",
		description: [`Choose a card in your Draw Pile and add it into your Hand.`],
		imageUrl: "potions/droplet_of_precognition.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: undefined,
	},
	{
		name: "Entropic Brew",
		category: "POTION",
		id: "tmfn8",
		dlc: "BASE",
		description: [`Fill all your empty potion slots with random potions.`],
		imageUrl: "potions/entropic_brew.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: undefined,
	},
	{
		name: "Fairy in a Bottle",
		category: "POTION",
		id: "lew36",
		dlc: "BASE",
		description: [
			`When your HP would be reduced to 0, instead this potion is discarded and you heal to 30% of your Max HP.`,
		],
		imageUrl: "potions/fairy_in_a_bottle.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: [
			{
				modifier: {
					healPercent: 0.3,
				},
				trigger: "health reaches zero",
			},
		],
	},
	{
		name: "Fruit Juice",
		category: "POTION",
		id: "f65pd",
		dlc: "BASE",
		description: [`Gain 5 Max HP.`],
		imageUrl: "potions/fruit_juice.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: [
			{
				modifier: {
					health: 5,
				},
				trigger: "permanent",
			},
		],
	},
	{
		name: "Gigantification Potion",
		category: "POTION",
		id: "r74hp",
		dlc: "BASE",
		description: [`The next Attack you play deals triple damage.`],
		imageUrl: "potions/gigantification_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: [
			{
				modifier: {
					damageX: 3,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Liquid Memories",
		category: "POTION",
		id: "ki6qx",
		dlc: "BASE",
		description: [
			`Put a card from your Discard Pile into your Hand. It costs 0 Energy this turn.`,
		],
		imageUrl: "potions/liquid_memories.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: undefined,
	},
	{
		name: "Lucky Tonic",
		category: "POTION",
		id: "2op3b",
		dlc: "BASE",
		description: [`Gain 1 Buffer.`],
		imageUrl: "potions/lucky_tonic.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: undefined,
	},
	{
		name: `Mazaleth's Gift`,
		category: "POTION",
		id: "q7915",
		dlc: "BASE",
		description: [`Gain 1 Ritual.`],
		imageUrl: "potions/mazaleths_gift.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: undefined,
	},
	{
		name: "Orobic Acid",
		category: "POTION",
		id: "glc66",
		dlc: "BASE",
		description: [
			`Add a random Attack, Skill, and Power into your Hand. They're free to play this turn.`,
		],
		imageUrl: "potions/orobic_acid.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: undefined,
	},
	{
		name: "Shackling Potion",
		category: "POTION",
		id: "33nio",
		dlc: "BASE",
		description: [`ALL enemies lose 7 Strength this turn.`],
		imageUrl: "potions/shackling_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: [
			{
				modifier: {
					enemyStrength: -7,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Ship in a Bottle",
		category: "POTION",
		id: "pd9t1",
		dlc: "BASE",
		description: [`Gain 10 Block. Next turn, gain 10 Block.`],
		imageUrl: "potions/ship_in_a_bottle.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: [
			{
				modifier: {
					block: 10,
				},
				trigger: 2,
			},
		],
	},
	{
		name: "Snecko Oil",
		category: "POTION",
		id: "uica8",
		dlc: "BASE",
		description: [
			`Draw 7 cards. Randomize the cost of cards in your Hand this turn.`,
		],
		imageUrl: "potions/snecko_oil.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",

		modifiers: [
			{
				modifier: {
					draw: 7,
				},
				trigger: 1,
			},
		],
	},
	{
		name: `Soldier's Stew`,
		category: "POTION",
		id: "v6wu2",
		dlc: "BASE",
		description: [`All cards containing Strike gain 1 Replay this combat.`],
		imageUrl: "potions/soldiers_stew.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",
		linkedItems: { character: { name: "IRONCLAD" } },
		modifiers: undefined,
	},
	{
		name: "Ghost in a Jar",
		category: "POTION",
		id: "8708o",
		dlc: "BASE",
		description: [`Gain 1 Intangible.`],
		imageUrl: "potions/ghost_in_a_jar.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",
		linkedItems: { character: { name: "SILENT" } },
		modifiers: [
			{
				modifier: {
					intangible: 1,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Cosmic Concoction",
		category: "POTION",
		id: "nik2d",
		dlc: "BASE",
		description: [`Add 3 Upgraded Colorless cards into your Hand.`],
		imageUrl: "potions/cosmic_concoction.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",
		linkedItems: { character: { name: "REGENT" } },
		modifiers: undefined,
	},
	{
		name: "Pot of Ghouls",
		category: "POTION",
		id: "f354x",
		dlc: "BASE",
		description: [`Add 2 Souls into your Hand.`],
		imageUrl: "potions/pot_of_ghouls.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",
		linkedItems: { character: { name: "NECROBINDER" } },
		modifiers: undefined,
	},
	{
		name: "Essence of Darkness",
		category: "POTION",
		id: "k8up6",
		dlc: "BASE",
		description: [`Channel a Dark for each of your Orb Slots.`],
		imageUrl: "potions/essence_of_darkness.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "RARE",
		linkedItems: { character: { name: "DEFECT" } },
		modifiers: undefined,
	},

	// #region EVENT

	{
		name: "Foul Potion",
		category: "POTION",
		id: "uqjj0",
		dlc: "BASE",
		description: [
			`Deal 12 damage to EVERYONE.`,
			`Can be thrown at the Merchant for 100 Gold instead.`,
		],
		imageUrl: "potions/foul_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "EVENT",
		modifiers: [
			{
				modifier: {
					damage: 12,
				},
				trigger: 1,
			},
		],
	},
	{
		name: "Glowwater Potion",
		category: "POTION",
		id: "b0pda",
		dlc: "BASE",
		description: [`Exhaust your Hand. Draw 10 cards.`],
		imageUrl: "potions/glowwater_potion.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "EVENT",
		modifiers: [
			{
				modifier: {
					draw: 10,
				},
				trigger: 1,
			},
			{
				modifier: {
					exhaust: true,
				},
				trigger: 1,
			},
		],
	},

	// #region TOKEN
	{
		name: "Potion-Shaped Rock",
		category: "POTION",
		id: "kt6qv",
		dlc: "BASE",
		description: [`Deal 15 damage.`],
		imageUrl: "potions/potion_shaped_rock.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Potions_List`,
		location: undefined,
		rarity: "TOKEN",
		modifiers: [
			{
				modifier: {
					damage: 15,
				},
				trigger: 1,
			},
		],
	},
];

const POTION_RARITY_MAP: Record<string, SlayTheSpire2PotionRarity> = {
	common: "COMMON",
	uncommon: "UNCOMMON",
	rare: "RARE",
	event: "EVENT",
	token: "TOKEN",
};

export { POTION_RARITY_MAP, POTIONS, type SlayTheSpire2PotionItem };
