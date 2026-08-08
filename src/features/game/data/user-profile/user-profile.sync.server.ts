import { z } from "zod";
import { ensureUserProfile } from "#/features/game/data/user-profile/user-profile.server";
import { clampImagePosition } from "#/features/image-position/image-position";
import type { SyncHandler } from "#/features/sync/types";
import { REGISTERED_GAME_IDS } from "#/games-registry/public-registry";
import { type GameId, prisma } from "@/prisma";

// Self-contained guard (intentionally duplicated from user-profile.ts) so this
// server-only module never imports back from its client-safe sibling. "none" is
// a valid profile gameId, hence the extra set member.
const GAME_ID_SET = new Set<string>(["none", ...REGISTERED_GAME_IDS]);
const isGameId = (value: string): value is GameId => GAME_ID_SET.has(value);

// Mirrors UpdateProfileInput in user-profile.ts for the same reason as the guard
// above: that schema is used at module scope by a server-fn validator, so
// importing it here would be the one edge that drags prisma into the client bundle.
const ProfileFieldsPayload = z.object({
	displayName: z.string().min(1).max(100).optional(),
	bio: z.string().max(500).optional(),
});

export const userProfileSyncHandler: SyncHandler = async (op, userId) => {
	if (op.operation !== "upsert") {
		return {
			status: "error",
			message: `unsupported operation ${op.operation}`,
		};
	}

	const parsed = ProfileFieldsPayload.safeParse(op.payload ?? {});
	if (!parsed.success) {
		return { status: "error", message: parsed.error.issues[0].message };
	}
	const { displayName, bio } = parsed.data;
	if (displayName === undefined && bio === undefined) {
		return { status: "noop" };
	}

	await ensureUserProfile(userId);
	await prisma.userProfile.update({
		where: { userId },
		data: {
			...(displayName !== undefined && { displayName }),
			...(bio !== undefined && { bio }),
		},
	});
	return { status: "applied" };
};

export const userPrimaryAvatarSyncHandler: SyncHandler = async (op, userId) => {
	if (op.operation !== "delete") {
		return {
			status: "error",
			message: `unsupported operation ${op.operation}`,
		};
	}
	await ensureUserProfile(userId);
	await prisma.userProfile.update({
		where: { userId },
		data: { primaryAvatarId: null, primaryAvatarGameId: null },
	});
	return { status: "applied" };
};

export const userPrimaryHeaderImageSyncHandler: SyncHandler = async (
	op,
	userId,
) => {
	if (op.operation !== "delete") {
		return {
			status: "error",
			message: `unsupported operation ${op.operation}`,
		};
	}
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
	return { status: "applied" };
};

export const userHeaderImageOverrideSyncHandler: SyncHandler = async (
	op,
	userId,
) => {
	const payload = op.payload as {
		headerImageId?: string;
		headerImageGameId?: string;
		positionX?: number;
		positionY?: number;
		targetGameId?: string;
	} | null;

	const profile = await ensureUserProfile(userId);

	if (op.operation === "delete") {
		const rawTargetGameId = payload?.targetGameId;
		if (!rawTargetGameId)
			return { status: "error", message: "missing targetGameId" };
		if (!isGameId(rawTargetGameId))
			return { status: "error", message: `unknown gameId ${rawTargetGameId}` };
		await prisma.userHeaderImageOverride.deleteMany({
			where: { userProfileId: profile.id, gameId: rawTargetGameId },
		});
		return { status: "applied" };
	}

	const {
		headerImageId,
		headerImageGameId: rawHeaderImageGameId,
		targetGameId: rawTargetGameId,
	} = payload ?? {};
	if (!headerImageId)
		return { status: "error", message: "missing headerImageId" };
	if (!rawHeaderImageGameId)
		return { status: "error", message: "missing headerImageGameId" };
	if (!isGameId(rawHeaderImageGameId))
		return {
			status: "error",
			message: `unknown headerImageGameId ${rawHeaderImageGameId}`,
		};

	// Same rule as the remote write in user-profile.server.ts: an op that names
	// an image but no position centers it. The payload is replayed from a
	// client's queue, so the range is enforced here rather than assumed.
	const position = clampImagePosition({
		x: payload?.positionX,
		y: payload?.positionY,
	});
	const positionX = position.x;
	const positionY = position.y;

	if (rawTargetGameId) {
		if (!isGameId(rawTargetGameId))
			return {
				status: "error",
				message: `unknown targetGameId ${rawTargetGameId}`,
			};
		await prisma.userHeaderImageOverride.upsert({
			where: {
				userProfileId_gameId: {
					userProfileId: profile.id,
					gameId: rawTargetGameId,
				},
			},
			update: {
				headerImageId,
				headerImageGameId: rawHeaderImageGameId,
				headerImagePositionX: positionX,
				headerImagePositionY: positionY,
			},
			create: {
				userProfileId: profile.id,
				gameId: rawTargetGameId,
				headerImageId,
				headerImageGameId: rawHeaderImageGameId,
				headerImagePositionX: positionX,
				headerImagePositionY: positionY,
			},
		});
	} else {
		await prisma.userProfile.update({
			where: { userId },
			data: {
				primaryHeaderImageId: headerImageId,
				primaryHeaderImageGameId: rawHeaderImageGameId,
				primaryHeaderImagePositionX: positionX,
				primaryHeaderImagePositionY: positionY,
			},
		});
	}
	return { status: "applied" };
};

export const userAvatarOverrideSyncHandler: SyncHandler = async (
	op,
	userId,
) => {
	const payload = op.payload as {
		avatarId?: string;
		avatarGameId?: string;
		targetGameId?: string;
	} | null;

	const profile = await ensureUserProfile(userId);

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
			update: { avatarId, avatarGameId: rawAvatarGameId },
			create: {
				userProfileId: profile.id,
				gameId: rawTargetGameId,
				avatarId,
				avatarGameId: rawAvatarGameId,
			},
		});
	} else {
		await prisma.userProfile.update({
			where: { userId },
			data: { primaryAvatarId: avatarId, primaryAvatarGameId: rawAvatarGameId },
		});
	}
	return { status: "applied" };
};
