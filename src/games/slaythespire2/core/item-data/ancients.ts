import type { BaseSlayTheSpire2Item } from "#/games/slaythespire2/core/types.ts";
import type { SlayTheSpire2Ancient } from "@/prisma";

type SlayTheSpire2AncientItem = BaseSlayTheSpire2Item & {
	flavorText: string;
};

const ANCIENTS: SlayTheSpire2AncientItem[] = [
	{
		name: "Neow",
		category: "ANCIENT",
		id: "kKq5b",
		dlc: "BASE",
		description: [
			`Neow is one of the Ancients in Slay the Spire 2. She is unlocked after playing the first run of a save file and will subsequently always appear at the start of a new run, allowing you to choose one of 3 boons.`,
		],
		flavorText: `I've... remade you... ...go... ..up...`,
		imageUrl: "ancients/neow.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Neow`,
		modifiers: undefined,
		location: undefined,
	},
	{
		name: "Orobas",
		category: "ANCIENT",
		id: "cUJ2c",
		dlc: "BASE",
		description: [
			`Orobas is one of the possible Ancients for the start of Act 2.`,
		],
		flavorText: `Puppet puppet!! All the way up here?! Take these, take take!`,
		imageUrl: "ancients/orobas.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Orobas`,
		modifiers: undefined,
		location: undefined,
	},
	{
		name: "Pael",
		category: "ANCIENT",
		id: "rL4Ch",
		dlc: "BASE",
		description: [`Pael is one of the Ancients in Slay the Spire 2.`],
		flavorText: `A puppet has arrived? Can you check on Father? I'm too tired...`,
		imageUrl: "ancients/pael.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Pael`,
		modifiers: undefined,
		location: undefined,
	},
	{
		name: "Tezcatara",
		category: "ANCIENT",
		id: "2HSei",
		dlc: "BASE",
		description: [`Tezcatara is one of the Ancients in Slay the Spire 2.`],
		flavorText: `Oh, a visitor! Do come in, dear! What can Tezcatara do for you?`,
		imageUrl: "ancients/tezcatara.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Tezcatara`,
		modifiers: undefined,
		location: undefined,
	},
	{
		name: "Darv",
		category: "ANCIENT",
		id: "1I6ar",
		dlc: "BASE",
		description: [
			`Darv is one of the Ancients in Slay the Spire 2. He is the only Ancient who can appear in Act 2 or Act 3.`,
		],
		flavorText: `...where did I put... Oh! Come to see my collection!? Take anything from that pile over there, put it to good use!`,
		imageUrl: "ancients/darv.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Darv`,
		modifiers: undefined,
		location: undefined,
	},
	{
		name: `Nonupeipe`,
		category: "ANCIENT",
		id: "ayS8E",
		dlc: "BASE",
		description: [
			`Nonupeipe is one of the Ancients in Slay the Spire 2. They are one of the possible Ancients for the start of Act 3. `,
		],
		flavorText: `I haven't had a visitor in a millennia! You're looking quite drab, here, let's find something delightful for you to wear.`,
		imageUrl: "ancients/nonupeipe.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Nonupeipe`,
		modifiers: undefined,
		location: undefined,
	},
	{
		name: `Tanx`,
		category: "ANCIENT",
		id: "Nly9i",
		dlc: "BASE",
		description: [
			`Tanx is one of the Ancients in Slay the Spire 2. He is one of the possible Ancients for the start of Act 3. `,
		],
		flavorText: `SO WEAK! BUT YOU HAVE POTENTIAL! USE THIS WEAPON!!`,
		imageUrl: "ancients/tanx.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Tanx`,
		modifiers: undefined,
		location: undefined,
	},
	{
		name: "Vakuu",
		category: "ANCIENT",
		id: "",
		dlc: "BASE",
		description: [
			`Vakuu is one of the Ancients in Slay the Spire 2. He is one of the possible Ancients for the start of Act 3. `,
		],
		flavorText: `Give yourself to me and you will be feared as much as I.`,
		imageUrl: "ancients/vakuu.png",
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Vakuu`,
		modifiers: undefined,
		location: undefined,
	},
];

const ANCIENT_MAP: Record<string, SlayTheSpire2Ancient> = {
	neow: "NEOW",
	tanx: "TANX",
	vakuu: "VAKUU",
	orobas: "OROBAS",
	pael: "PAEL",
	tezcatara: "TEZCATARA",
	darv: "DARV",
	nonupeipe: "NONUPEIPE",
};

export { ANCIENT_MAP, ANCIENTS, type SlayTheSpire2AncientItem };
