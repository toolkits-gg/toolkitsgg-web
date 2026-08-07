import { clientEnv } from "#/env/client-env.ts";
import { getGameAvatars } from "#/game-registry/public-registry.ts";;
import type { GameId } from "@/prisma";

type ResolveAvatarParams = {
	primaryAvatarId: string | null | undefined;
	primaryAvatarGameId: GameId | null | undefined;
	overrides: Array<{ gameId: GameId; avatarId: string; avatarGameId: GameId }>;
	currentGameId: GameId;
	fallbackAvatarUrl: string | null | undefined;
};

function avatarImageUrl(imageUrl: string, gameId: GameId): string {
	if (imageUrl.startsWith("http")) return imageUrl;
	return `${clientEnv.VITE_CLOUDFRONT_URL}/games/${gameId}/${imageUrl.replace(/^\//, "")}`;
}

const resolveAvatar = (
	params: ResolveAvatarParams,
): {
	avatarUrl: string | null;
	avatarId: string | null;
	gameId: GameId | null;
} => {
	const {
		primaryAvatarId,
		primaryAvatarGameId,
		overrides,
		currentGameId,
		fallbackAvatarUrl,
	} = params;

	const override = overrides.find((o) => o.gameId === currentGameId);
	if (override) {
		const avatars = getGameAvatars(override.avatarGameId);
		const avatar = avatars?.find((a) => a.id === override.avatarId);
		if (avatar) {
			return {
				avatarUrl: avatarImageUrl(avatar.imageUrl, override.avatarGameId),
				avatarId: override.avatarId,
				gameId: override.avatarGameId,
			};
		}
	}

	if (primaryAvatarId && primaryAvatarGameId) {
		const avatars = getGameAvatars(primaryAvatarGameId);
		const avatar = avatars?.find((a) => a.id === primaryAvatarId);
		if (avatar) {
			return {
				avatarUrl: avatarImageUrl(avatar.imageUrl, primaryAvatarGameId),
				avatarId: primaryAvatarId,
				gameId: primaryAvatarGameId,
			};
		}
	}

	if (fallbackAvatarUrl) {
		return { avatarUrl: fallbackAvatarUrl, avatarId: null, gameId: null };
	}

	return { avatarUrl: null, avatarId: null, gameId: null };
};

export { avatarImageUrl, resolveAvatar };
