// User profile: client data hooks. Each hook inlines the backend choice (remote
// when authed + online, else local IndexedDB + a queued op for sync). Profile
// reads default to friendly placeholders when no record exists yet.

import { useNetwork } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteLocalAvatarOverride,
	getLocalAvatarOverrides,
	getLocalUserProfile,
	upsertLocalAvatarOverride,
	upsertLocalUserProfile,
} from "#/features/game/data/user-profile/user-profile.idb.ts";
import {
	buildGetProfileQueryKey,
	DEFAULT_BIO,
	getPublicUserProfileServerFn,
	getUserProfileServerFn,
	mapUserToProfileData,
	removeAvatarOverrideServerFn,
	removePrimaryAvatarServerFn,
	resolveDisplayName,
	type UserProfileData,
	updateAvatarServerFn,
	updateProfileServerFn,
} from "#/features/game/data/user-profile/user-profile.ts";
import { getOrCreateAnonUserId } from "#/features/sync/local-data/identity/anon-id.ts";
import { enqueueOp } from "#/features/sync/local-data/queue/pending-ops.ts";
import { useSession } from "#/integrations/better-auth/auth-client.ts";
import { getGameMetadata } from "#/game-registry/public-registry.ts";
import type { GameId } from "@/prisma";

const invalidateProfile = (queryClient: ReturnType<typeof useQueryClient>) =>
	queryClient.invalidateQueries({ queryKey: ["data", "userProfile"] });

export type GetProfileArgs = { userId?: string } | undefined;
export type UpdateAvatarInput = {
	avatarId: string;
	avatarGameId: GameId;
	targetGameId?: GameId;
};
export const useUserProfileQuery = (args?: GetProfileArgs) => {
	const { data: session } = useSession();
	const { online } = useNetwork();
	const authUserId = session?.user?.id ?? null;
	const resolvedId = args?.userId ?? authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId && online;

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
			const [profile, overrides] = await Promise.all([
				getLocalUserProfile(userId),
				getLocalAvatarOverrides(userId),
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
			};
		},
	});
};

export const useUpdateAvatar = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { online } = useNetwork();

	return useMutation<{ ok: true }, Error, UpdateAvatarInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const userId = authUserId ?? anonUserId;
			if (authUserId && online) return updateAvatarServerFn({ data: input });

			if (input.targetGameId) {
				await upsertLocalAvatarOverride({
					userId,
					gameId: input.targetGameId,
					avatarId: input.avatarId,
					avatarGameId: input.avatarGameId,
				});
			} else {
				await upsertLocalUserProfile({
					userId,
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
	const { online } = useNetwork();

	return useMutation<{ ok: true }, Error, void>({
		mutationFn: async () => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const userId = authUserId ?? anonUserId;
			if (authUserId && online) return removePrimaryAvatarServerFn();

			await upsertLocalUserProfile({
				userId,
				primaryAvatarId: null,
				primaryAvatarGameId: null,
			});
			await enqueueOp({
				anonUserId,
				entity: "userProfile",
				operation: "upsert",
				payload: {},
				idempotencyKey: `userProfile:removePrimary:${anonUserId}`,
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
	const { online } = useNetwork();

	return useMutation<{ ok: true }, Error, { targetGameId: GameId }>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const userId = authUserId ?? anonUserId;
			if (authUserId && online) {
				return removeAvatarOverrideServerFn({ data: input });
			}
			await deleteLocalAvatarOverride(userId, input.targetGameId);
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

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { online } = useNetwork();

	return useMutation<{ ok: true }, Error, { displayName: string; bio: string }>(
		{
			mutationFn: async (input) => {
				const authUserId = session?.user?.id ?? null;
				const anonUserId = getOrCreateAnonUserId();
				const userId = authUserId ?? anonUserId;
				if (authUserId && online) return updateProfileServerFn({ data: input });

				await upsertLocalUserProfile({
					userId,
					displayName: input.displayName,
					bio: input.bio,
				});
				await enqueueOp({
					anonUserId,
					entity: "userProfile",
					operation: "upsert",
					payload: input,
					idempotencyKey: `userProfile:update:${anonUserId}`,
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
