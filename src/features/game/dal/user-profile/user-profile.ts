import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUserId } from "#/features/auth/dal/require-user.server.ts";
import { getGameAvatars } from "#/features/game/registry/game-registry.tsx";
import { GameId, prisma } from "@/prisma";

const AvatarInput = z.object({
	avatarId: z.string(),
	avatarGameId: z.enum(GameId),
	targetGameId: z.enum(GameId).optional(),
});

const updateAvatarServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => AvatarInput.parse(v))
	.handler(async ({ data }) => {
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
		const userId = await requireUserId();
		await prisma.userProfile.update({
			where: { userId },
			data: { primaryAvatarId: null, primaryAvatarGameId: null },
		});
		return { ok: true as const };
	},
);

const RemoveOverrideInput = z.object({ targetGameId: z.enum(GameId) });

const removeAvatarOverrideServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => RemoveOverrideInput.parse(v))
	.handler(async ({ data }) => {
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
	.inputValidator((v: unknown) => UpdateProfileInput.parse(v))
	.handler(async ({ data }) => {
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
	.inputValidator((v: unknown) => z.object({ userId: z.string() }).parse(v))
	.handler(async ({ data }) => {
		return prisma.user.findUnique({
			where: { id: data.userId },
			include: {
				userProfile: {
					include: { avatarOverrides: true },
				},
			},
		});
	});

export {
	getPublicUserProfileServerFn,
	removeAvatarOverrideServerFn,
	removePrimaryAvatarServerFn,
	updateAvatarServerFn,
	updateProfileServerFn,
};
