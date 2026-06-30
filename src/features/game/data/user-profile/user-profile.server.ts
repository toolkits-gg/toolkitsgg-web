import type { UserWithProfile } from "#/features/game/data/user-profile/user-profile.ts";
import {
	getOptionalUserId,
	requireUserId,
} from "#/features/user/require-user.server.ts";
import { getGameAvatars } from "#/registry/game-public-registry.tsx";
import { type GameId, prisma } from "@/prisma";

type UpdateAvatarData = {
	avatarId: string;
	avatarGameId: GameId;
	targetGameId?: GameId;
};

const updateAvatar = async (data: UpdateAvatarData) => {
	const userId = await requireUserId();

	const avatars = getGameAvatars(data.avatarGameId);
	const avatarExists = avatars?.some((a) => a.id === data.avatarId);
	if (!avatarExists) {
		throw new Error(
			`Avatar ${data.avatarId} not found in game ${data.avatarGameId}`,
		);
	}

	const profile = await prisma.userProfile.findUnique({ where: { userId } });
	if (!profile) throw new Error("User profile not found");

	if (data.targetGameId) {
		await prisma.userAvatarOverride.upsert({
			where: {
				userProfileId_gameId: {
					userProfileId: profile.id,
					gameId: data.targetGameId,
				},
			},
			update: { avatarId: data.avatarId },
			create: {
				userProfileId: profile.id,
				gameId: data.targetGameId,
				avatarId: data.avatarId,
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

const removePrimaryAvatar = async () => {
	const userId = await requireUserId();
	await prisma.userProfile.update({
		where: { userId },
		data: { primaryAvatarId: null, primaryAvatarGameId: null },
	});
	return { ok: true as const };
};

const removeAvatarOverride = async (targetGameId: GameId) => {
	const userId = await requireUserId();
	const profile = await prisma.userProfile.findUnique({ where: { userId } });
	if (!profile) throw new Error("User profile not found");

	await prisma.userAvatarOverride.deleteMany({
		where: { userProfileId: profile.id, gameId: targetGameId },
	});
	return { ok: true as const };
};

const updateProfile = async (data: { displayName?: string; bio?: string }) => {
	const userId = await requireUserId();
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

const getPublicUserProfile = (userId: string): Promise<UserWithProfile> =>
	prisma.user.findUnique({
		where: { id: userId },
		include: {
			userProfile: {
				include: { avatarOverrides: true },
			},
		},
	});

const getViewerUserId = () => getOptionalUserId();

const getUserProfile = async (): Promise<UserWithProfile> => {
	const userId = await requireUserId();
	return prisma.user.findUnique({
		where: { id: userId },
		include: {
			userProfile: {
				include: { avatarOverrides: true },
			},
		},
	});
};

export {
	getPublicUserProfile,
	getUserProfile,
	getViewerUserId,
	removeAvatarOverride,
	removePrimaryAvatar,
	updateAvatar,
	updateProfile,
};
