import type { GameId } from "@/prisma";

/** Per-game avatar override for a user - mirrors the Prisma UserAvatarOverride model. */
interface LocalUserAvatarOverride {
	id: string;
	userId: string;
	gameId: GameId;
	avatarId: string;
	avatarGameId: GameId;
	createdAt: Date;
	updatedAt: Date;
}

/** Per-game profile header image override - mirrors Prisma UserHeaderImageOverride. */
interface LocalUserHeaderImageOverride {
	id: string;
	userId: string;
	gameId: GameId;
	headerImageId: string;
	headerImageGameId: GameId;
	headerImagePositionX: number;
	headerImagePositionY: number;
	createdAt: Date;
	updatedAt: Date;
}

/** User profile record - mirrors the Prisma UserProfile model. */
interface LocalUserProfile {
	userId: string;
	displayName: string;
	bio: string;
	primaryAvatarId: string | null;
	primaryAvatarGameId: GameId | null;
	primaryHeaderImageId: string | null;
	primaryHeaderImageGameId: GameId | null;
	primaryHeaderImagePositionX: number;
	primaryHeaderImagePositionY: number;
	createdAt: Date;
	updatedAt: Date;
}

/** User's favorited game - mirrors the Prisma UserFavoriteGame model. */
interface LocalUserFavoriteGame {
	userId: string;
	gameId: GameId;
	createdAt: Date;
	updatedAt: Date;
}

export type {
	LocalUserAvatarOverride,
	LocalUserFavoriteGame,
	LocalUserHeaderImageOverride,
	LocalUserProfile,
};
