// User profile: client-safe helpers, types, and input validation, plus the
// TanStack created-builds-fn wrappers. Each wrapper delegates to ./user-profile.created-builds.ts;
// those imports are referenced only inside handler bodies, so the compiler strips
// them (and prisma) from the client bundle.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getPublicUserProfile,
	getUserProfile,
	getViewerUserId,
	removeAvatarOverride,
	removePrimaryAvatar,
	updateAvatar,
	updateProfile,
} from "#/features/game/data/user-profile/user-profile.server.ts";
import { REGISTERED_GAME_IDS } from "#/registry/game-public-registry.tsx";
import type { GameId } from "@/prisma";

const GAME_ID_SET = new Set<string>(["none", ...REGISTERED_GAME_IDS]);

// biome-ignore lint/style/useExportsLast: <Needed for the AvatarInput zod schema>
export const isGameId = (value: string): value is GameId =>
	GAME_ID_SET.has(value);

const AvatarInput = z.object({
	avatarId: z.string(),
	avatarGameId: z.string().refine(isGameId),
	targetGameId: z.string().refine(isGameId).optional(),
});

export type UserProfileData = {
	displayName: string;
	bio: string;
	avatarUrl: string | null;
	primaryAvatarId: string | null;
	primaryAvatarGameId: GameId | null;
	avatarOverrides: { gameId: GameId; avatarId: string; avatarGameId: GameId }[];
};

// Not using UserProfileData type due to needed `null` flexibility.
export type UserWithProfile = {
	UserProfile: {
		displayName: string;
		bio: string;
		avatarUrl: string | null;
		primaryAvatarId: string | null;
		primaryAvatarGameId: string | null;
		avatarOverrides: { gameId: string; avatarId: string }[];
	} | null;
} | null;

export type GetProfileInput = { userId?: string } | undefined;

export const mapUserToProfileData = (
	user: UserWithProfile,
): UserProfileData | null => {
	if (!user?.UserProfile) return null;
	const profile = user.UserProfile;
	return {
		displayName: profile.displayName,
		bio: profile.bio,
		avatarUrl: profile.avatarUrl ?? null,
		primaryAvatarId: profile.primaryAvatarId ?? null,
		primaryAvatarGameId: profile.primaryAvatarGameId as GameId | null,
		avatarOverrides: profile.avatarOverrides.map((o) => ({
			gameId: o.gameId as GameId,
			avatarId: o.avatarId,
			// Server-side overrides don't store avatarGameId; use gameId as fallback.
			avatarGameId: o.gameId as GameId,
		})),
	};
};

// Inner cache-key tail (without the ["data", ...] prefix).
export const getProfileQueryKeyTail = (userId: string) =>
	["userProfile", "getProfile", userId] as const;

// Full cache key, used from route loaders that prefetch via queryClient directly
// and from the client hook so both resolve to the same key.
export const buildGetProfileQueryKey = (userId: string) =>
	["data", ...getProfileQueryKeyTail(userId)] as const;

export const updateAvatarServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => AvatarInput.parse(v))
	.handler(async ({ data }) => updateAvatar(data));

export const removePrimaryAvatarServerFn = createServerFn({
	method: "POST",
}).handler(async () => removePrimaryAvatar());

const RemoveOverrideInput = z.object({
	targetGameId: z.string().refine(isGameId),
});

export const removeAvatarOverrideServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => RemoveOverrideInput.parse(v))
	.handler(async ({ data }) => removeAvatarOverride(data.targetGameId));

const UpdateProfileInput = z.object({
	displayName: z.string().min(1).max(100).optional(),
	bio: z.string().max(500).optional(),
});

export const updateProfileServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => UpdateProfileInput.parse(v))
	.handler(async ({ data }) => updateProfile(data));

export const getPublicUserProfileServerFn = createServerFn({ method: "GET" })
	.validator((v: unknown) => z.object({ userId: z.string() }).parse(v))
	.handler(
		async ({ data }): Promise<UserWithProfile> =>
			getPublicUserProfile(data.userId),
	);

export const getViewerUserIdServerFn = createServerFn({
	method: "GET",
}).handler(async () => getViewerUserId());

export const getUserProfileServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<UserWithProfile> => getUserProfile(),
);
