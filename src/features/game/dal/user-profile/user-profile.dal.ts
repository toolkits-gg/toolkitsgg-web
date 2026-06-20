import { createServerFn } from "@tanstack/react-start";
import {
	getOptionalUserId,
	requireUserId,
} from "#/features/auth/require-user.server.ts";
import { defineDalRead, defineDalWrite } from "#/features/dal/define-action.ts";
import type { DalContext } from "#/features/dal/types.ts";
import { prisma } from "#/features/db/client.ts";
import {
	deleteLocalAvatarOverride,
	getLocalAvatarOverrides,
	getLocalUserProfile,
	upsertLocalAvatarOverride,
	upsertLocalUserProfile,
} from "#/features/game/dal/user-profile/user-profile.idb.ts";
import {
	getPublicUserProfileServerFn,
	removeAvatarOverrideServerFn,
	removePrimaryAvatarServerFn,
	updateAvatarServerFn,
	updateProfileServerFn,
} from "#/features/game/dal/user-profile/user-profile.ts";
import { getGameMetadata } from "#/features/game/registry/game-registry.tsx";
import type { GameId } from "@/prisma";

type UserProfileData = {
	displayName: string;
	bio: string;
	avatarUrl: string | null;
	primaryAvatarId: string | null;
	primaryAvatarGameId: GameId | null;
	avatarOverrides: { gameId: GameId; avatarId: string; avatarGameId: GameId }[];
};

// Not using UserProfileData type due to needed `null` flexibility
type UserWithProfile = {
	userProfile: {
		displayName: string;
		bio: string;
		avatarUrl: string | null;
		primaryAvatarId: string | null;
		primaryAvatarGameId: string | null;
		avatarOverrides: { gameId: string; avatarId: string }[];
	} | null;
} | null;

type GetProfileInput = { userId?: string } | undefined;

const mapUserToProfileData = (
	user: UserWithProfile,
): UserProfileData | null => {
	if (!user?.userProfile) return null;
	const profile = user.userProfile;
	return {
		displayName: profile.displayName,
		bio: profile.bio,
		avatarUrl: profile.avatarUrl ?? null,
		primaryAvatarId: profile.primaryAvatarId ?? null,
		primaryAvatarGameId: (profile.primaryAvatarGameId as GameId) ?? null,
		avatarOverrides: profile.avatarOverrides.map((o) => ({
			gameId: o.gameId as GameId,
			avatarId: o.avatarId,
			// Server-side overrides don't store avatarGameId; use gameId as fallback
			avatarGameId: o.gameId as GameId,
		})),
	};
};

// Inner cache-key tail (without the ["dal", ...] prefix that toQueryOptions adds).
const getProfileQueryKeyTail = (userId: string) =>
	["userProfile", "getProfile", userId] as const;

// Full cache key, used from route loaders that prefetch via queryClient directly
// Client-side useDalQuery resolves to the same prefixed key via toQueryOptions.
const buildGetProfileQueryKey = (userId: string) =>
	["dal", ...getProfileQueryKeyTail(userId)] as const;

const resolveLocalUserId = (ctx: DalContext): string => {
	return ctx.authUserId ?? ctx.anonUserId;
};

const createUserProfileDal = () => {
	return {
		getProfile: defineDalRead<GetProfileInput, UserProfileData | null>({
			queryKey: (input, ctx) =>
				getProfileQueryKeyTail(
					input?.userId ?? ctx?.authUserId ?? ctx?.anonUserId ?? "",
				),
			remote: async (input) => {
				const user = input?.userId
					? await getPublicUserProfileServerFn({
							data: { userId: input.userId },
						})
					: await getUserProfileServerFn();
				return mapUserToProfileData(user);
			},
			local: async (input, ctx) => {
				const userId = input?.userId ?? resolveLocalUserId(ctx);
				const [profile, overrides] = await Promise.all([
					getLocalUserProfile(userId),
					getLocalAvatarOverrides(userId),
				]);
				return {
					displayName: profile?.displayName ?? "Traveler",
					bio: profile?.bio ?? "No bio provided.",
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
		}),

		updateAvatar: defineDalWrite<
			{ avatarId: string; avatarGameId: GameId; targetGameId?: GameId },
			{ ok: true }
		>({
			entity: "userAvatarOverride",
			operation: "upsert",
			invalidates: ["userProfile"],
			buildIdempotencyKey: (input, ctx) =>
				`userAvatarOverride:upsert:${ctx.anonUserId}:${input.targetGameId ?? "primary"}:${input.avatarId}`,
			describe: (input) =>
				input.targetGameId
					? {
							title: "Set avatar override",
							details: `For ${getGameMetadata(input.targetGameId)?.label ?? input.targetGameId}`,
							gameId: input.targetGameId,
						}
					: {
							title: "Updated primary avatar",
						},
			remote: async (input) => updateAvatarServerFn({ data: input }),
			local: async (input, ctx) => {
				const userId = resolveLocalUserId(ctx);
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
				return { ok: true as const };
			},
		}),

		removePrimaryAvatar: defineDalWrite<void, { ok: true }>({
			entity: "userProfile",
			operation: "upsert",
			invalidates: ["userProfile"],
			buildIdempotencyKey: (_input, ctx) =>
				`userProfile:removePrimary:${ctx.anonUserId}`,
			describe: () => ({
				title: "Removed primary avatar",
			}),
			remote: async () => removePrimaryAvatarServerFn(),
			local: async (_input, ctx) => {
				const userId = resolveLocalUserId(ctx);
				await upsertLocalUserProfile({
					userId,
					primaryAvatarId: null,
					primaryAvatarGameId: null,
				});
				return { ok: true as const };
			},
		}),

		removeAvatarOverride: defineDalWrite<
			{ targetGameId: GameId },
			{ ok: true }
		>({
			entity: "userAvatarOverride",
			operation: "delete",
			invalidates: ["userProfile"],
			buildIdempotencyKey: (input, ctx) =>
				`userAvatarOverride:delete:${ctx.anonUserId}:${input.targetGameId}`,
			describe: (input) => ({
				title: "Removed avatar override",
				details: `For ${getGameMetadata(input.targetGameId)?.label ?? input.targetGameId}`,
				gameId: input.targetGameId,
			}),
			remote: async (input) => removeAvatarOverrideServerFn({ data: input }),
			local: async (input, ctx) => {
				const userId = resolveLocalUserId(ctx);
				await deleteLocalAvatarOverride(userId, input.targetGameId);
				return { ok: true as const };
			},
		}),

		updateProfile: defineDalWrite<
			{ displayName: string; bio: string },
			{ ok: true }
		>({
			entity: "userProfile",
			operation: "upsert",
			invalidates: ["userProfile"],
			buildIdempotencyKey: (_input, ctx) =>
				`userProfile:update:${ctx.anonUserId}`,
			describe: (input) => ({
				title: "Updated profile",
				details: `Display name -> ${input.displayName}`,
			}),
			remote: async (input) => updateProfileServerFn({ data: input }),
			local: async (input, ctx) => {
				const userId = resolveLocalUserId(ctx);
				await upsertLocalUserProfile({
					userId,
					displayName: input.displayName,
					bio: input.bio,
				});
				return { ok: true as const };
			},
		}),
	};
};

const getViewerUserIdServerFn = createServerFn({
	method: "GET",
}).handler(async () => getOptionalUserId());

const getUserProfileServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await requireUserId();
		return prisma.user.findUnique({
			where: { id: userId },
			include: {
				userProfile: {
					include: { avatarOverrides: true },
				},
			},
		});
	},
);

export {
	buildGetProfileQueryKey,
	createUserProfileDal,
	getUserProfileServerFn,
	getViewerUserIdServerFn,
	mapUserToProfileData,
};
