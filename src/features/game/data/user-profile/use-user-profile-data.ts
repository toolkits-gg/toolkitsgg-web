// User profile: client data hooks. Each hook inlines the backend choice (remote
// when signed in, else local IndexedDB + a queued op for sync). Profile reads
// default to friendly placeholders when no record exists yet.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	buildGetProfileQueryKey,
	DEFAULT_BIO,
	getPublicUserProfileServerFn,
	getUserProfileServerFn,
	mapUserToProfileData,
	removeAvatarOverrideServerFn,
	removeHeaderImageOverrideServerFn,
	removePrimaryAvatarServerFn,
	removePrimaryHeaderImageServerFn,
	resolveDisplayName,
	type UserProfileData,
	updateAvatarServerFn,
	updateHeaderImageServerFn,
	updateProfileServerFn,
} from "#/features/game/data/user-profile/user-profile";
import {
	deleteLocalAvatarOverride,
	deleteLocalHeaderImageOverride,
	getLocalAvatarOverrides,
	getLocalHeaderImageOverrides,
	getLocalUserProfile,
	upsertLocalAvatarOverride,
	upsertLocalHeaderImageOverride,
	upsertLocalUserProfile,
} from "#/features/game/data/user-profile/user-profile.idb";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id";
import { enqueueOp } from "#/features/sync/queue/pending-ops";
import { getGameMetadata } from "#/games-registry/public-registry";
import { useSession } from "#/integrations/better-auth/auth-client";
import type { GameId } from "@/prisma";

const invalidateProfile = (queryClient: ReturnType<typeof useQueryClient>) =>
	queryClient.invalidateQueries({ queryKey: ["data", "userProfile"] });

type GetProfileArgs = { userId?: string } | undefined;
type UpdateAvatarInput = {
	avatarId: string;
	avatarGameId: GameId;
	targetGameId?: GameId;
};
type UpdateHeaderImageInput = {
	headerImageId: string;
	headerImageGameId: GameId;
	/** Framing for this image. Omitted means centered, never "keep the old one". */
	positionX?: number;
	positionY?: number;
	targetGameId?: GameId;
};
export const useUserProfileQuery = (args?: GetProfileArgs) => {
	const { data: session } = useSession();
	const authUserId = session?.user?.id ?? null;
	const resolvedId = args?.userId ?? authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId;

	return useQuery({
		queryKey: buildGetProfileQueryKey(resolvedId),
		queryFn: async (): Promise<UserProfileData | null> => {
			if (remote) {
				const user = args?.userId
					? await getPublicUserProfileServerFn({
							data: { userId: args.userId },
						})
					: await getUserProfileServerFn();
				return mapUserToProfileData(user);
			}
			const userId = args?.userId ?? authUserId ?? getOrCreateAnonUserId();
			const [profile, overrides, headerOverrides] = await Promise.all([
				getLocalUserProfile(userId),
				getLocalAvatarOverrides(userId),
				getLocalHeaderImageOverrides(userId),
			]);
			// The session name only describes the signed-in user, so it is not a
			// fallback when reading somebody else's profile.
			const sessionUser = args?.userId ? null : session?.user;
			return {
				displayName: resolveDisplayName(profile?.displayName, sessionUser),
				bio: profile?.bio ?? DEFAULT_BIO,
				avatarUrl: null,
				primaryAvatarId: profile?.primaryAvatarId ?? null,
				primaryAvatarGameId: (profile?.primaryAvatarGameId as GameId) ?? null,
				avatarOverrides: overrides.map((o) => ({
					gameId: o.gameId,
					avatarId: o.avatarId,
					avatarGameId: o.avatarGameId,
				})),
				primaryHeaderImageId: profile?.primaryHeaderImageId ?? null,
				primaryHeaderImageGameId:
					(profile?.primaryHeaderImageGameId as GameId) ?? null,
				primaryHeaderImagePositionX:
					profile?.primaryHeaderImagePositionX ?? 0.5,
				primaryHeaderImagePositionY:
					profile?.primaryHeaderImagePositionY ?? 0.5,
				headerImageOverrides: headerOverrides.map((o) => ({
					gameId: o.gameId,
					headerImageId: o.headerImageId,
					headerImageGameId: o.headerImageGameId,
					headerImagePositionX: o.headerImagePositionX ?? 0.5,
					headerImagePositionY: o.headerImagePositionY ?? 0.5,
				})),
			};
		},
	});
};

export const useUpdateAvatar = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, UpdateAvatarInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return updateAvatarServerFn({ data: input });

			if (input.targetGameId) {
				await upsertLocalAvatarOverride({
					userId: anonUserId,
					gameId: input.targetGameId,
					avatarId: input.avatarId,
					avatarGameId: input.avatarGameId,
				});
			} else {
				await upsertLocalUserProfile({
					userId: anonUserId,
					primaryAvatarId: input.avatarId,
					primaryAvatarGameId: input.avatarGameId,
				});
			}
			await enqueueOp({
				anonUserId,
				entity: "userAvatarOverride",
				operation: "upsert",
				payload: input,
				idempotencyKey: `userAvatarOverride:upsert:${anonUserId}:${input.targetGameId ?? "primary"}:${input.avatarId}`,
				summary: input.targetGameId
					? {
							title: "Set avatar override",
							details: `For ${getGameMetadata(input.targetGameId)?.label ?? input.targetGameId}`,
							gameId: input.targetGameId,
						}
					: { title: "Updated primary avatar" },
			});
			return { ok: true as const };
		},
		onSuccess: () => invalidateProfile(queryClient),
	});
};

export const useRemovePrimaryAvatar = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, void>({
		mutationFn: async () => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return removePrimaryAvatarServerFn();

			await upsertLocalUserProfile({
				userId: anonUserId,
				primaryAvatarId: null,
				primaryAvatarGameId: null,
			});
			await enqueueOp({
				anonUserId,
				entity: "userPrimaryAvatar",
				operation: "delete",
				payload: {},
				idempotencyKey: `userPrimaryAvatar:delete:${anonUserId}`,
				summary: { title: "Removed primary avatar" },
			});
			return { ok: true as const };
		},
		onSuccess: () => invalidateProfile(queryClient),
	});
};

export const useRemoveAvatarOverride = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, { targetGameId: GameId }>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) {
				return removeAvatarOverrideServerFn({ data: input });
			}
			await deleteLocalAvatarOverride(anonUserId, input.targetGameId);
			await enqueueOp({
				anonUserId,
				entity: "userAvatarOverride",
				operation: "delete",
				payload: input,
				idempotencyKey: `userAvatarOverride:delete:${anonUserId}:${input.targetGameId}`,
				summary: {
					title: "Removed avatar override",
					details: `For ${getGameMetadata(input.targetGameId)?.label ?? input.targetGameId}`,
					gameId: input.targetGameId,
				},
			});
			return { ok: true as const };
		},
		onSuccess: () => invalidateProfile(queryClient),
	});
};

export const useUpdateHeaderImage = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, UpdateHeaderImageInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) {
				return updateHeaderImageServerFn({ data: input });
			}

			if (input.targetGameId) {
				await upsertLocalHeaderImageOverride({
					userId: anonUserId,
					gameId: input.targetGameId,
					headerImageId: input.headerImageId,
					headerImageGameId: input.headerImageGameId,
					headerImagePositionX: input.positionX,
					headerImagePositionY: input.positionY,
				});
			} else {
				await upsertLocalUserProfile({
					userId: anonUserId,
					primaryHeaderImageId: input.headerImageId,
					primaryHeaderImageGameId: input.headerImageGameId,
					primaryHeaderImagePositionX: input.positionX,
					primaryHeaderImagePositionY: input.positionY,
				});
			}
			await enqueueOp({
				anonUserId,
				entity: "userHeaderImageOverride",
				operation: "upsert",
				payload: input,
				// The position is part of the key: repositioning the wallpaper that
				// is already set is a real second edit, and a key that ignored it
				// would let enqueueOp's dedupe drop the adjustment.
				idempotencyKey: `userHeaderImageOverride:upsert:${anonUserId}:${input.targetGameId ?? "primary"}:${input.headerImageId}:${input.positionX ?? 0.5},${input.positionY ?? 0.5}`,
				summary: input.targetGameId
					? {
							title: "Set header image override",
							details: `For ${getGameMetadata(input.targetGameId)?.label ?? input.targetGameId}`,
							gameId: input.targetGameId,
						}
					: { title: "Updated primary header image" },
			});
			return { ok: true as const };
		},
		onSuccess: () => invalidateProfile(queryClient),
	});
};

export const useRemovePrimaryHeaderImage = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, void>({
		mutationFn: async () => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return removePrimaryHeaderImageServerFn();

			await upsertLocalUserProfile({
				userId: anonUserId,
				primaryHeaderImageId: null,
				primaryHeaderImageGameId: null,
			});
			await enqueueOp({
				anonUserId,
				entity: "userPrimaryHeaderImage",
				operation: "delete",
				payload: {},
				idempotencyKey: `userPrimaryHeaderImage:delete:${anonUserId}`,
				summary: { title: "Removed primary header image" },
			});
			return { ok: true as const };
		},
		onSuccess: () => invalidateProfile(queryClient),
	});
};

export const useRemoveHeaderImageOverride = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, { targetGameId: GameId }>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) {
				return removeHeaderImageOverrideServerFn({ data: input });
			}
			await deleteLocalHeaderImageOverride(anonUserId, input.targetGameId);
			await enqueueOp({
				anonUserId,
				entity: "userHeaderImageOverride",
				operation: "delete",
				payload: input,
				idempotencyKey: `userHeaderImageOverride:delete:${anonUserId}:${input.targetGameId}`,
				summary: {
					title: "Removed header image override",
					details: `For ${getGameMetadata(input.targetGameId)?.label ?? input.targetGameId}`,
					gameId: input.targetGameId,
				},
			});
			return { ok: true as const };
		},
		onSuccess: () => invalidateProfile(queryClient),
	});
};

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, { displayName: string; bio: string }>(
		{
			mutationFn: async (input) => {
				const authUserId = session?.user?.id ?? null;
				const anonUserId = getOrCreateAnonUserId();
				if (authUserId) return updateProfileServerFn({ data: input });

				await upsertLocalUserProfile({
					userId: anonUserId,
					displayName: input.displayName,
					bio: input.bio,
				});
				await enqueueOp({
					anonUserId,
					entity: "userProfile",
					operation: "upsert",
					payload: input,
					// Unique per edit: a stable key would make enqueueOp's dedupe drop a
					// second edit made before the first one syncs.
					idempotencyKey: `userProfile:update:${anonUserId}:${crypto.randomUUID()}`,
					summary: {
						title: "Updated profile",
						details: `Display name -> ${input.displayName}`,
					},
				});
				return { ok: true as const };
			},
			onSuccess: () => invalidateProfile(queryClient),
		},
	);
};
