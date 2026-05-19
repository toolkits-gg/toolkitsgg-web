import type { GameMetadata } from "#/features/game/core/types";
import { GAME_ID } from "#/games/slaythespire2/core/constants";
import { SlayTheSpire2Logo } from "#/games/slaythespire2/core/Logo";

const METADATA: GameMetadata = {
	id: GAME_ID,
	name: "Slay the Spire II",
	label: "Slay the Spire 2",
	description: `The iconic roguelike deckbuilder returns. Craft a unique deck, encounter bizarre creatures, and discover relics of immense power in Slay the Spire 2!`,
	faviconSourcePath: "games/slaythespire2/logos/512STS2.png",
	LogoComponent: SlayTheSpire2Logo,
	externalResources: [
		{
			label: "Wiki.gg",
			link: "https://slaythespire.wiki.gg",
		},
	],
};

export { METADATA };
