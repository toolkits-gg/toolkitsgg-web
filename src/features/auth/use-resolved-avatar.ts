import { resolveAvatar } from "#/features/auth/utils.ts";
import { useDalQuery } from "#/features/dal/use-dal-query.ts";
import { createUserProfileDal } from "#/features/game/dal/user-profile/user-profile.dal.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

type UseResolvedAvatarArgs = { userId?: string } | undefined;

const useResolvedAvatar = (args?: UseResolvedAvatarArgs) => {
	const gameId = useGameId();
	const userProfileDal = createUserProfileDal();

	const { data: profile } = useDalQuery(
		userProfileDal.getProfile,
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
