import type { SlayTheSpire2CardItem } from "#/games/slaythespire2/core/item-data/cards";
import type { BaseSlayTheSpire2Item } from "#/games/slaythespire2/core/types";
import type { SlayTheSpire2Character } from "@/prisma";

type SlayTheSpire2CharacterItem = BaseSlayTheSpire2Item & {
	health: number;
	startingDeck: SlayTheSpire2CardItem[];
};

const CHARACTERS: SlayTheSpire2CharacterItem[] = [
	{
		name: "Ironclad",
		category: "CHARACTER",
		id: "1g3k2",
		dlc: "BASE",
		description: [
			`The last soldier of the Ironclads. Crushes foes with sword and flame against his will`,
		],
		imageUrl: "characters/char_select_ironclad.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Ironclad`,
		location: undefined,
		health: 80,
		startingDeck: [], // TODO
		modifiers: undefined,
	},
	{
		name: "Silent",
		category: "CHARACTER",
		id: "d4yey",
		dlc: "BASE",
		description: [
			`A huntress from outside the Spire. Ready to stab and poison anything in her way`,
		],
		imageUrl: "characters/char_select_silent.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Silent`,
		location: undefined,
		health: 70,
		startingDeck: [], // TODO
		modifiers: undefined,
	},
	{
		name: "Regent",
		category: "CHARACTER",
		id: "5elsj",
		dlc: "BASE",
		description: [
			`Heir to the Throne of Stars. Wields cosmic powers but his minions do the work.`,
		],
		imageUrl: "characters/char_select_regent.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Regent`,
		location: undefined,
		health: 60,
		startingDeck: [], // TODO
		modifiers: undefined,
	},
	{
		name: "Necrobinder",
		category: "CHARACTER",
		id: "2p0n2",
		dlc: "BASE",
		description: [
			`A Spireborn lich who seeks revenge. Calls upon her trusty left hand, Osty, in combat`,
		],
		imageUrl: "characters/char_select_necrobinder.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Necrobinder`,
		location: undefined,
		health: 66,
		startingDeck: [], // TODO
		modifiers: undefined,
	},
	{
		name: "Defect",
		category: "CHARACTER",
		id: "e4es9",
		dlc: "BASE",
		description: [
			`An automaton eternally modifying itself to survive. Deploys Orb technology when it must fight`,
		],
		imageUrl: "characters/char_select_defect.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Defect`,
		location: undefined,
		health: 75,
		startingDeck: [], // TODO
		modifiers: undefined,
	},
];

const CHARACTER_MAP: Record<string, SlayTheSpire2Character> = {
	ironclad: "IRONCLAD",
	silent: "SILENT",
	defect: "DEFECT",
	regent: "REGENT",
	necrobinder: "NECROBINDER",
};

export { CHARACTER_MAP, CHARACTERS, type SlayTheSpire2CharacterItem };
