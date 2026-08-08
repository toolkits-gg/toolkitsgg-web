import type {
	LocalUserAvatarOverride,
	LocalUserHeaderImageOverride,
	LocalUserProfile,
} from "#/features/local-db/types";
import {
	overrideId,
	userAvatarOverrideStore,
	userHeaderImageOverrideStore,
	userProfileStore,
} from "#/features/local-db/user-stores";
import type { GameId } from "@/prisma";

type ProfileUpdate = {
	userId: string;
	displayName?: string;
	bio?: string;
	primaryAvatarId?: string | null;
	primaryAvatarGameId?: GameId | null;
	primaryHeaderImageId?: string | null;
	primaryHeaderImageGameId?: GameId | null;
	primaryHeaderImagePositionX?: number;
	primaryHeaderImagePositionY?: number;
};

export const getLocalUserProfile = (
	userId: string,
): Promise<LocalUserProfile | null> =>
	userProfileStore.findUnique({ where: { userId } });

export const upsertLocalUserProfile = (
	data: ProfileUpdate,
): Promise<LocalUserProfile> => {
	const { userId, ...fields } = data;
	// Setting or clearing the primary header image reframes it, so the focal
	// point returns to centre unless the same call names one.
	const changed =
		fields.primaryHeaderImageId === undefined
			? fields
			: {
					...fields,
					primaryHeaderImagePositionX:
						fields.primaryHeaderImagePositionX ?? 0.5,
					primaryHeaderImagePositionY:
						fields.primaryHeaderImagePositionY ?? 0.5,
				};

	return userProfileStore.upsert({
		where: { userId },
		update: changed,
		create: { userId, ...changed },
	});
};

export const getLocalAvatarOverrides = (
	userId: string,
): Promise<LocalUserAvatarOverride[]> =>
	userAvatarOverrideStore.findMany({ where: { userId } });

export const upsertLocalAvatarOverride = (data: {
	userId: string;
	gameId: GameId;
	avatarId: string;
	avatarGameId: GameId;
}): Promise<LocalUserAvatarOverride> => {
	const id = overrideId(data.userId, data.gameId);
	return userAvatarOverrideStore.upsert({
		where: { id },
		update: { avatarId: data.avatarId, avatarGameId: data.avatarGameId },
		create: { id, ...data },
	});
};

export const deleteLocalAvatarOverride = (
	userId: string,
	gameId: GameId,
): Promise<void> =>
	userAvatarOverrideStore.deleteMany({
		where: { id: overrideId(userId, gameId) },
	});

export const getLocalHeaderImageOverrides = (
	userId: string,
): Promise<LocalUserHeaderImageOverride[]> =>
	userHeaderImageOverrideStore.findMany({ where: { userId } });

export const upsertLocalHeaderImageOverride = (data: {
	userId: string;
	gameId: GameId;
	headerImageId: string;
	headerImageGameId: GameId;
	headerImagePositionX?: number;
	headerImagePositionY?: number;
}): Promise<LocalUserHeaderImageOverride> => {
	const id = overrideId(data.userId, data.gameId);
	// As with the primary image, changing the override reframes it.
	const position = {
		headerImagePositionX: data.headerImagePositionX ?? 0.5,
		headerImagePositionY: data.headerImagePositionY ?? 0.5,
	};
	return userHeaderImageOverrideStore.upsert({
		where: { id },
		update: {
			headerImageId: data.headerImageId,
			headerImageGameId: data.headerImageGameId,
			...position,
		},
		create: { id, ...data, ...position },
	});
};

export const deleteLocalHeaderImageOverride = (
	userId: string,
	gameId: GameId,
): Promise<void> =>
	userHeaderImageOverrideStore.deleteMany({
		where: { id: overrideId(userId, gameId) },
	});
