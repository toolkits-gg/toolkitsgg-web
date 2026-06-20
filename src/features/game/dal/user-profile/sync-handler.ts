import type { SyncHandler } from "#/features/dal/types.ts";
import { GameId, prisma } from "@/prisma";

const userProfileHandler: SyncHandler = async (op, userId) => {
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
		const targetGameId = GameId[rawTargetGameId as keyof typeof GameId];
		if (!targetGameId)
			return { status: "error", message: `unknown gameId ${rawTargetGameId}` };
		await prisma.userAvatarOverride.deleteMany({
			where: { userProfileId: profile.id, gameId: targetGameId },
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
	const avatarGameId = GameId[rawAvatarGameId as keyof typeof GameId];
	if (!avatarGameId)
		return {
			status: "error",
			message: `unknown avatarGameId ${rawAvatarGameId}`,
		};

	if (rawTargetGameId) {
		const targetGameId = GameId[rawTargetGameId as keyof typeof GameId];
		if (!targetGameId)
			return {
				status: "error",
				message: `unknown targetGameId ${rawTargetGameId}`,
			};
		await prisma.userAvatarOverride.upsert({
			where: {
				userProfileId_gameId: {
					userProfileId: profile.id,
					gameId: targetGameId,
				},
			},
			update: { avatarId },
			create: { userProfileId: profile.id, gameId: targetGameId, avatarId },
		});
	} else {
		await prisma.userProfile.update({
			where: { userId },
			data: { primaryAvatarId: avatarId, primaryAvatarGameId: avatarGameId },
		});
	}
	return { status: "applied" };
};

export { userAvatarOverrideHandler, userProfileHandler };
