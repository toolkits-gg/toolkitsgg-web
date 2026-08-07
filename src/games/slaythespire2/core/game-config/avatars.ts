import type { GameAvatar } from "#/features/game/types.ts";
import { CARDS } from "#/games/slaythespire2/core/item-data/cards";
import { CHARACTERS } from "#/games/slaythespire2/core/item-data/characters";
import { POTIONS } from "#/games/slaythespire2/core/item-data/potions";
import { RELICS } from "#/games/slaythespire2/core/item-data/relics";

const characters: GameAvatar[] = CHARACTERS.sort((a, b) =>
	a.name.localeCompare(b.name),
)
	.filter((c) => c.imageUrl)
	.map(({ id, name, imageUrl, category }) => ({
		id,
		name,
		imageUrl,
		category,
	}));

const cards: GameAvatar[] = CARDS.sort((a, b) => a.name.localeCompare(b.name))
	.filter((c) => c.imageUrl)
	.map(({ id, name, imageUrl, category }) => ({
		id,
		name,
		imageUrl,
		category,
	}));

const relics: GameAvatar[] = RELICS.sort((a, b) => a.name.localeCompare(b.name))
	.filter((c) => c.imageUrl)
	.map(({ id, name, imageUrl, category }) => ({
		id,
		name,
		imageUrl,
		category,
	}));

const potions: GameAvatar[] = POTIONS.sort((a, b) =>
	a.name.localeCompare(b.name),
)
	.filter((c) => c.imageUrl)
	.map(({ id, name, imageUrl, category }) => ({
		id,
		name,
		imageUrl,
		category,
	}));

const AVATARS: GameAvatar[] = [...characters, ...cards, ...relics, ...potions];

export { AVATARS };
