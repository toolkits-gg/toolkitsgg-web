import {
	STORE_USER_AVATAR_OVERRIDE,
	STORE_USER_PROFILE,
} from "#/features/sync/local-data/local/constants.ts";
import { getLocalDB } from "#/features/sync/local-data/local/local-db.ts";
import type {
	LocalUserAvatarOverride,
	LocalUserProfile,
} from "#/features/sync/local-data/local/types.ts";
import type { GameId } from "@/prisma";

export const getLocalUserProfile = async (
	userId: string,
): Promise<LocalUserProfile | undefined> => {
	const db = await getLocalDB();
	if (!db) return undefined;
	return db.get(STORE_USER_PROFILE, userId);
};

export const upsertLocalUserProfile = async (data: {
	userId: string;
	displayName?: string;
	bio?: string;
	primaryAvatarId?: string | null;
	primaryAvatarGameId?: GameId | null;
}): Promise<LocalUserProfile> => {
	const now = new Date().toISOString();
	const db = await getLocalDB();
	const existing = db
		? await db.get(STORE_USER_PROFILE, data.userId)
		: undefined;

	const next: LocalUserProfile = {
		userId: data.userId,
		displayName: data.displayName ?? existing?.displayName ?? "Traveler",
		bio: data.bio ?? existing?.bio ?? "No bio provided.",
		primaryAvatarId:
			"primaryAvatarId" in data
				? (data.primaryAvatarId ?? null)
				: (existing?.primaryAvatarId ?? null),
		primaryAvatarGameId:
			"primaryAvatarGameId" in data
				? (data.primaryAvatarGameId ?? null)
				: (existing?.primaryAvatarGameId ?? null),
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
	};

	if (db) await db.put(STORE_USER_PROFILE, next);
	return next;
};

export const getLocalAvatarOverrides = async (
	userId: string,
): Promise<LocalUserAvatarOverride[]> => {
	const db = await getLocalDB();
	if (!db) return [];
	return db.getAllFromIndex(STORE_USER_AVATAR_OVERRIDE, "userId", userId);
};

export async function upsertLocalAvatarOverride(data: {
	userId: string;
	gameId: GameId;
	avatarId: string;
	avatarGameId: GameId;
}): Promise<LocalUserAvatarOverride> {
	const now = new Date().toISOString();
	const id = `${data.userId}:${data.gameId}`;
	const db = await getLocalDB();
	const existing = db
		? await db.get(STORE_USER_AVATAR_OVERRIDE, id)
		: undefined;

	const next: LocalUserAvatarOverride = {
		id,
		userId: data.userId,
		gameId: data.gameId,
		avatarId: data.avatarId,
		avatarGameId: data.avatarGameId,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
	};

	if (db) await db.put(STORE_USER_AVATAR_OVERRIDE, next);
	return next;
}

export const deleteLocalAvatarOverride = async (
	userId: string,
	gameId: GameId,
): Promise<void> => {
	const db = await getLocalDB();
	if (!db) return;
	await db.delete(STORE_USER_AVATAR_OVERRIDE, `${userId}:${gameId}`);
};
