import { useGameId } from "#/features/game/use-game-id";
import { useUserProfile } from "#/features/user/use-user-profile";

/**
 * Profile destinations live in two parallel route trees: `/account/profile/$userId/*`
 * for authenticated users and `/profile/*` for local accounts. Only the former
 * validates a `gameId` search param, so the branches stay whole object literals
 * rather than one object with conditional keys - spreading a widened `LinkProps`
 * onto a `<Link>` would decouple `to` from `params`/`search`.
 */
const useProfileLinks = () => {
	const { isAuthenticated, session } = useUserProfile();
	const gameId = useGameId();

	const userId = session?.user.id;

	if (isAuthenticated && userId) {
		const params = { userId };
		const search = gameId === "none" ? {} : { gameId };
		return {
			home: { to: "/account/profile/$userId", params },
			collectedItems: {
				to: "/account/profile/$userId/collected-items",
				params,
				search,
			},
			likedBuilds: {
				to: "/account/profile/$userId/liked-builds",
				params,
				search,
			},
			buildCollections: {
				to: "/account/profile/$userId/build-collections",
				params,
				search,
			},
			createdBuilds: {
				to: "/account/profile/$userId/created-builds",
				params,
				search,
			},
		} as const;
	}

	return {
		home: { to: "/profile" },
		collectedItems: { to: "/profile/collected-items" },
		likedBuilds: { to: "/profile/liked-builds" },
		buildCollections: { to: "/profile/build-collections" },
		createdBuilds: { to: "/profile/created-builds" },
	} as const;
};

export { useProfileLinks };
