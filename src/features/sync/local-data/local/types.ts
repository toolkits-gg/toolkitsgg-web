import type { GameId } from "@/prisma";

/** Per-game avatar override for a user — mirrors the Prisma UserAvatarOverride model. */
interface LocalUserAvatarOverride {
	id: string;
	userId: string;
	gameId: GameId;
	avatarId: string;
	avatarGameId: GameId;
	createdAt: string;
	updatedAt: string;
}

/** User profile record — mirrors the Prisma UserProfile model. */
interface LocalUserProfile {
	userId: string;
	displayName: string;
	bio: string;
	primaryAvatarId: string | null;
	primaryAvatarGameId: GameId | null;
	createdAt: string;
	updatedAt: string;
}

/** User's favorited game — mirrors the Prisma UserFavoriteGame model. */
interface LocalUserFavoriteGame {
	userId: string;
	gameId: GameId;
	createdAt: string;
	updatedAt: string;
}

export type {
	LocalUserAvatarOverride,
	LocalUserFavoriteGame,
	LocalUserProfile,
};
