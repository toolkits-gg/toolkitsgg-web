import type { BaseSlayTheSpire2Item } from "#/games/slaythespire2/core/types";

type SlayTheSpire2CardItem = BaseSlayTheSpire2Item & {
	cost: {
		energy: number;
		/**
		 * Absolute energy cost once the card is upgraded,
		 * when it differs from the cost field.
		 * `energy` (mirrors the wiki `CostPlus` field).
		 * `undefined` means the cost is unchanged on upgrade.
		 */
		energyUpgraded: number | undefined;
		secondary:
			| Partial<{
					hp: number;
			  }>
			| undefined;
	};
};

/**
 * `description` lines may embed `[base|upgraded]` upgrade tokens, matching the
 * wiki source 1:1 — e.g. `"Deal [8|10] damage."` shows 8 base / 10 upgraded.
 * Either side may be empty (`"...Discard Pile[| +3]."`). The `AppItemDescription`
 * component parses these for display;
 *
 * see `#/features/game/items/description-tokens`.
 */
const CARDS: SlayTheSpire2CardItem[] = [
	{
		name: "Bash",
		category: "CARD",
		id: "bash",
		dlc: "BASE",
		description: [`Deal [8|10] damage.`, `Apply [2|3] Vulnerable.`],
		imageUrl: "", // TODO
		wikiUrl: `https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Bash`,
		location: undefined,
		cost: {
			energy: 2,
			energyUpgraded: undefined,
			secondary: undefined,
		},
		modifiers: undefined,
	},
];

export { CARDS, type SlayTheSpire2CardItem };
