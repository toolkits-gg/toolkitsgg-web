/**
 * Compares the local CARDS item data array against the wiki's card data.
 * Prints matched / new / stale entries to the terminal.
 *
 * On slaythespire.wiki.gg the card data is split into submodules
 * `Module:Cards/StS2 data/<Character>`.
 *
 * Run with: pnpm tsx src/games/slaythespire2/wiki/cards.ts
 */
import { cleanWikiTextPreservingTokens } from "#/features/wiki-sync/clean-wiki-text";
import {
	CARDS,
	type SlayTheSpire2CardItem,
} from "#/games/slaythespire2/core/item-data/cards.ts";
import {
	type CompareResult,
	getString,
	syncWikiCategory,
} from "#/games/slaythespire2/wiki/sync-category.ts";
import {renderDescriptionVariant} from "#/components/AppItemDescription.tsx";

const CARD_SUBMODULES = [
	"Ironclad",
	"Silent",
	"Regent",
	"Necrobinder",
	"Defect",
	"Colorless",
] as const;

const WIKI_URLS = CARD_SUBMODULES.map(
	(c) =>
		`https://slaythespire.wiki.gg/wiki/Module:Cards/StS2%20data/${c}?action=raw`,
);

type LocalCard = (typeof CARDS)[number];

type WikiCard = {
	name: string;
	description: string[];
	cost: number | undefined;
	costPlus: number | undefined;
	type: string;
	rarity: string;
	color: string;
	image: string;
};

const getNumber = (
	fields: Record<string, unknown>,
	key: string,
): number | undefined =>
	typeof fields[key] === "number" ? (fields[key] as number) : undefined;

const normalizeEntry = (
	name: string,
	fields: Record<string, unknown>,
): WikiCard => ({
	name,
	description: cleanWikiTextPreservingTokens(getString(fields, "Text")),
	cost: getNumber(fields, "Cost"),
	costPlus: getNumber(fields, "CostPlus"),
	type: getString(fields, "Type"),
	rarity: getString(fields, "Rarity"),
	color: getString(fields, "Color"),
	image: getString(fields, "Image"),
});

/**
 * Renders every line to one variant and serializes, so base and upgraded text
 * are compared independently.
 */
const renderVariant = (lines: string[], variant: "base" | "upgraded"): string =>
	JSON.stringify(lines.map((line) => renderDescriptionVariant(line, variant)));

const compareCard = (local: LocalCard, wiki: WikiCard): CompareResult => {
	const localBase = renderVariant(local.description, "base");
	const wikiBase = renderVariant(wiki.description, "base");
	const localUpgraded = renderVariant(local.description, "upgraded");
	const wikiUpgraded = renderVariant(wiki.description, "upgraded");

	const localEnergy = local.cost.energy;
	const wikiEnergy = wiki.cost;
	const localEnergyUpgraded = local.cost.energyUpgraded;
	const wikiEnergyUpgraded = wiki.costPlus;

	const baseDiffers = localBase !== wikiBase;
	const upgradedDiffers = localUpgraded !== wikiUpgraded;
	const energyDiffers = wikiEnergy !== undefined && localEnergy !== wikiEnergy;
	const energyUpgradedDiffers =
		wikiEnergyUpgraded !== undefined &&
		localEnergyUpgraded !== wikiEnergyUpgraded;

	const differingFields: string[] = [];
	if (baseDiffers) differingFields.push("description (base)");
	if (upgradedDiffers) differingFields.push("description (upgraded)");
	if (energyDiffers) differingFields.push("cost.energy");
	if (energyUpgradedDiffers) differingFields.push("cost.energyUpgraded");

	return {
		differingFields,
		printDetails: () => {
			if (baseDiffers) {
				console.log(`    description (base) local: ${localBase}`);
				console.log(`    description (base) wiki:  ${wikiBase}`);
			}
			if (upgradedDiffers) {
				console.log(`    description (upgraded) local: ${localUpgraded}`);
				console.log(`    description (upgraded) wiki:  ${wikiUpgraded}`);
			}
			if (energyDiffers) {
				console.log(`    cost.energy local: ${localEnergy}`);
				console.log(`    cost.energy wiki:  ${wikiEnergy}`);
			}
			if (energyUpgradedDiffers) {
				console.log(`    cost.energyUpgraded local: ${localEnergyUpgraded}`);
				console.log(`    cost.energyUpgraded wiki:  ${wikiEnergyUpgraded}`);
			}
		},
	};
};

void syncWikiCategory<SlayTheSpire2CardItem, WikiCard>({
	wikiUrls: WIKI_URLS,
	label: "cards",
	localItems: CARDS,
	normalizeEntry,
	compareItem: compareCard,
});
