import {
	createFileRoute,
	notFound,
	Outlet,
	useParams,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { GameComingSoonCard } from "#/components/GameComingSoonCard";
import { GameNotFoundCard } from "#/components/GameNotFoundCard";
import { NotFoundCard } from "#/components/NotFoundCard";
import { gameCanonicalUrl } from "#/features/game/subdomain-rewrite";
import { useSetActiveGame } from "#/features/game/use-set-active-game";
import {
	gameHasContent,
	getValidatedGameId,
} from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";

const GameNotFound = () => {
	const params = useParams({ strict: false });

	if (getValidatedGameId(params.gameId ?? "")) {
		return <NotFoundCard />;
	}

	return <GameNotFoundCard />;
};

const GameLayout = () => {
	const { gameId } = Route.useParams();
	const setActiveGame = useSetActiveGame();

	// Persist the route's game so reserved routes without a game segment
	// (profile pages) still resolve it after navigating away.
	useEffect(() => {
		setActiveGame(gameId as GameId);
	}, [gameId, setActiveGame]);

	if (!gameHasContent(gameId)) return <GameComingSoonCard gameId={gameId} />;

	return <Outlet />;
};

const Route = createFileRoute("/$gameId")({
	beforeLoad: ({ params }) => {
		if (!getValidatedGameId(params.gameId)) throw notFound();
	},
	head: ({ params, matches }) => ({
		links: [
			{
				rel: "canonical",
				href: gameCanonicalUrl(
					params.gameId,
					matches[matches.length - 1]?.pathname ?? `/${params.gameId}`,
				),
			},
			{
				rel: "icon",
				type: "image/x-icon",
				href: `/favicons/${params.gameId}/favicon.ico`,
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: `/favicons/${params.gameId}/favicon-32x32.png`,
			},
			{
				rel: "apple-touch-icon",
				href: `/favicons/${params.gameId}/apple-touch-icon.png`,
			},
		],
	}),
	notFoundComponent: GameNotFound,
	component: GameLayout,
});

export { Route };
