import { useUserProfileQuery } from "#/features/game/data/user-profile/use-user-profile-data";
import { useGameId } from "#/features/game/use-game-id";
import { resolveHeaderImage } from "#/features/user/header-image";

type UseResolvedHeaderImageArgs = { userId?: string } | undefined;

const useResolvedHeaderImage = (args?: UseResolvedHeaderImageArgs) => {
	const gameId = useGameId();

	const { data: profile } = useUserProfileQuery(
		args?.userId ? { userId: args.userId } : undefined,
	);

	return resolveHeaderImage({
		primaryHeaderImageId: profile?.primaryHeaderImageId ?? null,
		primaryHeaderImageGameId: profile?.primaryHeaderImageGameId ?? null,
		primaryHeaderImagePositionX: profile?.primaryHeaderImagePositionX,
		primaryHeaderImagePositionY: profile?.primaryHeaderImagePositionY,
		overrides: profile?.headerImageOverrides ?? [],
		currentGameId: gameId,
	});
};

export { useResolvedHeaderImage };
