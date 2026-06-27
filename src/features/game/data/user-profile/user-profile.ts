// Shared user-profile helpers and types, plus server-fn wrappers whose server-
// only dependencies are loaded lazily inside the handlers.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getGameAvatars,
	REGISTERED_GAME_IDS,
} from "#/features/game/registry/game-public-registry.tsx";
import type { SyncHandler } from "#/features/sync/types.ts";
import type { GameId } from "@/prisma";

type UserProfileData = {
	displayName: string;
	bio: string;
	avatarUrl: string | null;
	primaryAvatarId: string | null;
	primaryAvatarGameId: GameId | null;
	avatarOverrides: { gameId: GameId; avatarId: string; avatarGameId: GameId }[];
};

// Not using UserProfileData type due to needed `null` flexibility.
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

const GAME_ID_SET = new Set<string>(["none", ...REGISTERED_GAME_IDS]);

const isGameId = (value: string): value is GameId => GAME_ID_SET.has(value);

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
const getProfileQueryKeyTail = (userId: string) =>
	["userProfile", "getProfile", userId] as const;

// Full cache key, used from route loaders that prefetch via queryClient directly
// and from the client hook so both resolve to the same key.
const buildGetProfileQueryKey = (userId: string) =>
	["data", ...getProfileQueryKeyTail(userId)] as const;

const AvatarInput = z.object({
	avatarId: z.string(),
	avatarGameId: z.string().refine(isGameId),
	targetGameId: z.string().refine(isGameId).optional(),
});

const updateAvatarServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => AvatarInput.parse(v))
	.handler(async ({ data }) => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
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
	});

const removePrimaryAvatarServerFn = createServerFn({ method: "POST" }).handler(
	async () => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		const userId = await requireUserId();
		await prisma.userProfile.update({
			where: { userId },
			data: { primaryAvatarId: null, primaryAvatarGameId: null },
		});
		return { ok: true as const };
	},
);

const RemoveOverrideInput = z.object({
	targetGameId: z.string().refine(isGameId),
});

const removeAvatarOverrideServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => RemoveOverrideInput.parse(v))
	.handler(async ({ data }) => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		const userId = await requireUserId();
		const profile = await prisma.userProfile.findUnique({ where: { userId } });
		if (!profile) throw new Error("User profile not found");

		await prisma.userAvatarOverride.deleteMany({
			where: { userProfileId: profile.id, gameId: data.targetGameId },
		});
		return { ok: true as const };
	});

const UpdateProfileInput = z.object({
	displayName: z.string().min(1).max(100).optional(),
	bio: z.string().max(500).optional(),
});

const updateProfileServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => UpdateProfileInput.parse(v))
	.handler(async ({ data }) => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
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
	});

const getPublicUserProfileServerFn = createServerFn({ method: "GET" })
	.validator((v: unknown) => z.object({ userId: z.string() }).parse(v))
	.handler(async ({ data }): Promise<UserWithProfile> => {
		const { prisma } = await import("@/prisma");
		return prisma.user.findUnique({
			where: { id: data.userId },
			include: {
				userProfile: {
					include: { avatarOverrides: true },
				},
			},
		});
	});

const getViewerUserIdServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const { getOptionalUserId: getOptionalUserIdFn } = await import(
			"#/features/user/require-user.server.ts"
		);
		return getOptionalUserIdFn();
	},
);

const getUserProfileServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<UserWithProfile> => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
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

const userProfileHandler: SyncHandler = async (op, userId) => {
	const { prisma } = await import("@/prisma");
	if (op.operation === "upsert") {
		await prisma.userProfile.update({
			where: { userId },
			data: { primaryAvatarId: null, primaryAvatarGameId: null },
		});
		return { status: "applied" };
	}
	return { status: "error", message: `unsupported operation ${op.operation}` };
};

const userAvatarOverrideHandler: SyncHandler = async (op, userId) => {
	const { prisma } = await import("@/prisma");
	const payload = op.payload as {
		avatarId?: string;
		avatarGameId?: string;
		targetGameId?: string;
	} | null;

	const profile = await prisma.userProfile.findUnique({ where: { userId } });
	if (!profile) return { status: "error", message: "user profile not found" };

	if (op.operation === "delete") {
		const rawTargetGameId = payload?.targetGameId;
		if (!rawTargetGameId)
			return { status: "error", message: "missing targetGameId" };
		if (!isGameId(rawTargetGameId))
			return { status: "error", message: `unknown gameId ${rawTargetGameId}` };
		await prisma.userAvatarOverride.deleteMany({
			where: { userProfileId: profile.id, gameId: rawTargetGameId },
		});
		return { status: "applied" };
	}

	const {
		avatarId,
		avatarGameId: rawAvatarGameId,
		targetGameId: rawTargetGameId,
	} = payload ?? {};
	if (!avatarId) return { status: "error", message: "missing avatarId" };
	if (!rawAvatarGameId)
		return { status: "error", message: "missing avatarGameId" };
	if (!isGameId(rawAvatarGameId))
		return {
			status: "error",
			message: `unknown avatarGameId ${rawAvatarGameId}`,
		};

	if (rawTargetGameId) {
		if (!isGameId(rawTargetGameId))
			return {
				status: "error",
				message: `unknown targetGameId ${rawTargetGameId}`,
			};
		await prisma.userAvatarOverride.upsert({
			where: {
				userProfileId_gameId: {
					userProfileId: profile.id,
					gameId: rawTargetGameId,
				},
			},
			update: { avatarId },
			create: { userProfileId: profile.id, gameId: rawTargetGameId, avatarId },
		});
	} else {
		await prisma.userProfile.update({
			where: { userId },
			data: { primaryAvatarId: avatarId, primaryAvatarGameId: rawAvatarGameId },
		});
	}
	return { status: "applied" };
};

export type { GetProfileInput, UserProfileData, UserWithProfile };
export {
	buildGetProfileQueryKey,
	getProfileQueryKeyTail,
	getPublicUserProfileServerFn,
	getUserProfileServerFn,
	getViewerUserIdServerFn,
	isGameId,
	mapUserToProfileData,
	removeAvatarOverrideServerFn,
	removePrimaryAvatarServerFn,
	updateAvatarServerFn,
	updateProfileServerFn,
	userAvatarOverrideHandler,
	userProfileHandler,
};
