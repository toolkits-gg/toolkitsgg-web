import type { UserWithProfile } from "#/features/game/data/user-profile/user-profile.ts";
import {
	getOptionalUserId,
	requireUserId,
} from "#/features/user/require-user.server.ts";
import { getGameAvatars } from "#/game-registry/public-registry.ts";
import { enforceUserWriteLimit } from "#/integrations/rate-limiter-flexible/enforce-user-write-limit.ts";

import { type GameId, prisma } from "@/prisma";

type UpdateAvatarData = {
	avatarId: string;
	avatarGameId: GameId;
	targetGameId?: GameId;
};

export const ensureUserProfile = async (userId: string) =>
	prisma.userProfile.upsert({
		where: { userId },
		update: {},
		create: { userId },
	});

export const updateAvatar = async (data: UpdateAvatarData) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);

	const avatars = getGameAvatars(data.avatarGameId);
	const avatarExists = avatars?.some((a) => a.id === data.avatarId);
	if (!avatarExists) {
		throw new Error(
			`Avatar ${data.avatarId} not found in game ${data.avatarGameId}`,
		);
	}

	const profile = await ensureUserProfile(userId);

	if (data.targetGameId) {
		await prisma.userAvatarOverride.upsert({
			where: {
				userProfileId_gameId: {
					userProfileId: profile.id,
					gameId: data.targetGameId,
				},
			},
			update: { avatarId: data.avatarId, avatarGameId: data.avatarGameId },
			create: {
				userProfileId: profile.id,
				gameId: data.targetGameId,
				avatarId: data.avatarId,
				avatarGameId: data.avatarGameId,
			},
		});
	} else {
		await prisma.userProfile.update({
			where: { userId },
			data: {
				primaryAvatarId: data.avatarId,
				primaryAvatarGameId: data.avatarGameId,
			},
		});
	}

	return { ok: true as const };
};

export const removePrimaryAvatar = async () => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await ensureUserProfile(userId);
	await prisma.userProfile.update({
		where: { userId },
		data: { primaryAvatarId: null, primaryAvatarGameId: null },
	});
	return { ok: true as const };
};

export const removeAvatarOverride = async (targetGameId: GameId) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	const profile = await ensureUserProfile(userId);

	await prisma.userAvatarOverride.deleteMany({
		where: { userProfileId: profile.id, gameId: targetGameId },
	});
	return { ok: true as const };
};

export const updateProfile = async (data: {
	displayName?: string;
	bio?: string;
}) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await ensureUserProfile(userId);
	await prisma.userProfile.update({
		where: { userId },
		data: {
			...(data.displayName !== undefined && {
				displayName: data.displayName,
			}),
			...(data.bio !== undefined && { bio: data.bio }),
		},
	});
	return { ok: true as const };
};

// Explicit select rather than include: this shape reaches the client, so it must
// not carry the rest of the User row (email, verification state) with it.
const profileSelect = {
	name: true,
	username: true,
	UserProfile: {
		select: {
			displayName: true,
			bio: true,
			avatarUrl: true,
			primaryAvatarId: true,
			primaryAvatarGameId: true,
			UserAvatarOverrides: {
				select: { gameId: true, avatarId: true, avatarGameId: true },
			},
		},
	},
} as const;

export const getPublicUserProfile = (
	userId: string,
): Promise<UserWithProfile> =>
	prisma.user.findUnique({
		where: { id: userId },
		select: profileSelect,
	});

export const getViewerUserId = () => getOptionalUserId();

export const getUserProfile = async (): Promise<UserWithProfile> => {
	const userId = await requireUserId();
	return prisma.user.findUnique({
		where: { id: userId },
		select: profileSelect,
	});
};
