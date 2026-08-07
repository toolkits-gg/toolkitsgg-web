import { useUserProfileQuery } from "#/features/game/data/user-profile/use-user-profile-data.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import { resolveAvatar } from "#/features/user/utils.ts";

type UseResolvedAvatarArgs = { userId?: string } | undefined;

const useResolvedAvatar = (args?: UseResolvedAvatarArgs) => {
	const gameId = useGameId();

	const { data: profile } = useUserProfileQuery(
		args?.userId ? { userId: args.userId } : undefined,
	);

	const { avatarUrl } = resolveAvatar({
		primaryAvatarId: profile?.primaryAvatarId ?? null,
		primaryAvatarGameId: profile?.primaryAvatarGameId ?? null,
		overrides: profile?.avatarOverrides ?? [],
		currentGameId: gameId,
		fallbackAvatarUrl: profile?.avatarUrl ?? null,
	});

	return { avatarUrl };
};

export { useResolvedAvatar };
