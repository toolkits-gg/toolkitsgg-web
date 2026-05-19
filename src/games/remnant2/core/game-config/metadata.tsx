import type { GameMetadata } from "#/features/game/core/types";
import { GAME_ID } from "#/games/remnant2/core/constants";
import { Remnant2Logo } from "#/games/remnant2/core/Logo";

const METADATA: GameMetadata = {
	id: GAME_ID,
	name: "Remnant II",
	label: "Remnant 2",
	description: `REMNANT II® pits survivors of humanity against new deadly creatures and god-like bosses across terrifying worlds. Play solo or co-op with two other friends to explore the depths of the unknown to stop an evil from destroying reality itself.`,
	faviconSourcePath: "games/remnant2/logos/512R2.png",
	LogoComponent: Remnant2Logo,
	externalResources: [
		{
			label: "Wiki.gg",
			link: "https://remnant2.wiki.gg/",
		},
	],
};

export { METADATA };
