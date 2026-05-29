import type { BaseSlayTheSpire2Item } from "#/games/slaythespire2/core/types";

type SlayTheSpire2CardItem = BaseSlayTheSpire2Item & {
	cost: {
		energy: number;
		secondary:
			| Partial<{
					hp: number;
			  }>
			| undefined;
	};
};

const CARDS: SlayTheSpire2CardItem[] = [
	{
		name: "Bash",
		category: "CARD",
		id: "bash",
		dlc: "BASE",
		description: [`Deal 8 damage. Apply 2 Vulnerable.`],
		imageUrl: "", // TODO
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Bash`,
		location: undefined,
		cost: {
			energy: 2,
			secondary: undefined,
		},
		modifiers: undefined,
	},
];

export { CARDS, type SlayTheSpire2CardItem };
