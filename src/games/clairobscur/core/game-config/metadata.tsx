import type { GameMetadata } from "#/features/game/core/types";
import { GAME_ID } from "#/games/clairobscur/core/constants";
import { ClairObscurLogo } from "#/games/clairobscur/core/Logo";

const METADATA: GameMetadata = {
	id: GAME_ID,
	name: "Clair Obscur: Expedition 33",
	label: "Clair Obscur",
	description: `Clair Obscur: Expedition 33 is a turn-based role-playing video game developed by French studio Sandfall Interactive and published by Kepler Interactive. It follows the volunteers of Expedition 33, who set out to destroy the Paintress, a being at the root of the yearly Gommage, which erases those above an ever-decreasing age.`,
	faviconSourcePath: "games/clairobscur/logos/512C33.png",
	LogoComponent: ClairObscurLogo,
	externalResources: [
		{
			label: "Fandom Wiki",
			link: "https://clair-obscur.fandom.com/wiki/Clair_Obscur_Wiki",
		},
	],
};

export { METADATA };
