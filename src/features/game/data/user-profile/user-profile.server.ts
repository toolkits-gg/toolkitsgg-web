import type { UserWithProfile } from "#/features/game/data/user-profile/user-profile";
import {
	getOptionalUserId,
	requireUserId,
} from "#/features/user/require-user.server";
import {
	getGameAvatars,
	getGameWallpapers,
} from "#/games-registry/public-registry";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";
import { type GameId, prisma } from "@/prisma";

type UpdateAvatarData = {
	avatarId: string;
	avatarGameId: GameId;
	targetGameId?: GameId;
};

type UpdateHeaderImageData = {
	headerImageId: string;
	headerImageGameId: GameId;
	positionX?: number;
	positionY?: number;
	targetGameId?: GameId;
};

const ensureUserProfile = async (userId: string) =>
	prisma.userProfile.upsert({
		where: { userId },
		update: {},
		create: { userId },
	});

const updateAvatar = async (data: UpdateAvatarData) => {
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

const removePrimaryAvatar = async () => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await ensureUserProfile(userId);
	await prisma.userProfile.update({
		where: { userId },
		data: { primaryAvatarId: null, primaryAvatarGameId: null },
	});
	return { ok: true as const };
};

const removeAvatarOverride = async (targetGameId: GameId) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	const profile = await ensureUserProfile(userId);

	await prisma.userAvatarOverride.deleteMany({
		where: { userProfileId: profile.id, gameId: targetGameId },
	});
	return { ok: true as const };
};

const updateHeaderImage = async (data: UpdateHeaderImageData) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);

	const wallpapers = getGameWallpapers(data.headerImageGameId);
	const exists = wallpapers?.some((w) => w.id === data.headerImageId);
	if (!exists) {
		throw new Error(
			`Wallpaper ${data.headerImageId} not found in game ${data.headerImageGameId}`,
		);
	}

	const profile = await ensureUserProfile(userId);

	// A position is only meaningful against the image it was framed for, so an
	// update that names an image but no position recenters rather than keeping
	// the framing of whatever was there before.
	const positionX = data.positionX ?? 0.5;
	const positionY = data.positionY ?? 0.5;

	if (data.targetGameId) {
		await prisma.userHeaderImageOverride.upsert({
			where: {
				userProfileId_gameId: {
					userProfileId: profile.id,
					gameId: data.targetGameId,
				},
			},
			update: {
				headerImageId: data.headerImageId,
				headerImageGameId: data.headerImageGameId,
				headerImagePositionX: positionX,
				headerImagePositionY: positionY,
			},
			create: {
				userProfileId: profile.id,
				gameId: data.targetGameId,
				headerImageId: data.headerImageId,
				headerImageGameId: data.headerImageGameId,
				headerImagePositionX: positionX,
				headerImagePositionY: positionY,
			},
		});
	} else {
		await prisma.userProfile.update({
			where: { userId },
			data: {
				primaryHeaderImageId: data.headerImageId,
				primaryHeaderImageGameId: data.headerImageGameId,
				primaryHeaderImagePositionX: positionX,
				primaryHeaderImagePositionY: positionY,
			},
		});
	}

	return { ok: true as const };
};

const removePrimaryHeaderImage = async () => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await ensureUserProfile(userId);
	await prisma.userProfile.update({
		where: { userId },
		data: {
			primaryHeaderImageId: null,
			primaryHeaderImageGameId: null,
			primaryHeaderImagePositionX: 0.5,
			primaryHeaderImagePositionY: 0.5,
		},
	});
	return { ok: true as const };
};

const removeHeaderImageOverride = async (targetGameId: GameId) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	const profile = await ensureUserProfile(userId);

	await prisma.userHeaderImageOverride.deleteMany({
		where: { userProfileId: profile.id, gameId: targetGameId },
	});
	return { ok: true as const };
};

const updateProfile = async (data: { displayName?: string; bio?: string }) => {
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
			primaryHeaderImageId: true,
			primaryHeaderImageGameId: true,
			primaryHeaderImagePositionX: true,
			primaryHeaderImagePositionY: true,
			UserAvatarOverrides: {
				select: { gameId: true, avatarId: true, avatarGameId: true },
			},
			UserHeaderImageOverrides: {
				select: {
					gameId: true,
					headerImageId: true,
					headerImageGameId: true,
					headerImagePositionX: true,
					headerImagePositionY: true,
				},
			},
		},
	},
} as const;

const getPublicUserProfile = (userId: string): Promise<UserWithProfile> =>
	prisma.user.findUnique({
		where: { id: userId },
		select: profileSelect,
	});

const getViewerUserId = () => getOptionalUserId();

const getUserProfile = async (): Promise<UserWithProfile> => {
	const userId = await requireUserId();
	return prisma.user.findUnique({
		where: { id: userId },
		select: profileSelect,
	});
};

export {
	ensureUserProfile,
	getPublicUserProfile,
	getUserProfile,
	getViewerUserId,
	removeAvatarOverride,
	removeHeaderImageOverride,
	removePrimaryAvatar,
	removePrimaryHeaderImage,
	updateAvatar,
	updateHeaderImage,
	updateProfile,
};
