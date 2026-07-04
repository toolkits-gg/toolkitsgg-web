// Offline-sync handlers for the user-profile entities (userProfile, userAvatarOverride).
// Split out from user-profile.created-builds.ts so the sync-replay path lives apart from the
// direct CRUD data access. Unlike most entities these handlers are hand-written rather
// than factory-built, because the avatar-override op fans out to two different Prisma
// rows (profile primary avatar vs. per-game override) depending on the payload. The
// `.created-builds.ts` suffix opts this into Start's import protection, keeping prisma out of
// the client bundle. Consumed only by the sync handler game-registry.

import type { SyncHandler } from "#/features/sync/local-data/types.ts";
import { REGISTERED_GAME_IDS } from "#/registry/game-public-registry.tsx";
import { type GameId, prisma } from "@/prisma";

// Self-contained guard (intentionally duplicated from user-profile.ts) so this
// created-builds-only module never imports back from its client-safe sibling. "none" is
// a valid profile gameId, hence the extra set member.
const GAME_ID_SET = new Set<string>(["none", ...REGISTERED_GAME_IDS]);
const isGameId = (value: string): value is GameId => GAME_ID_SET.has(value);

export const userProfileSyncHandler: SyncHandler = async (op, userId) => {
	if (op.operation === "upsert") {
		await prisma.userProfile.update({
			where: { userId },
			data: { primaryAvatarId: null, primaryAvatarGameId: null },
		});
		return { status: "applied" };
	}
	return { status: "error", message: `unsupported operation ${op.operation}` };
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
