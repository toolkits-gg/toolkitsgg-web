import {
	createFileRoute,
	notFound,
	Outlet,
	useParams,
} from "@tanstack/react-router";
import { GameNotFoundCard } from "#/components/GameNotFoundCard.tsx";
import { NotFoundCard } from "#/components/NotFoundCard.tsx";
import { gameCanonicalUrl } from "#/features/game/subdomain-rewrite.ts";
import { getValidatedGameId } from "#/registry/game-public-registry.tsx";

const GameNotFound = () => {
	const params = useParams({ strict: false });

	if (getValidatedGameId(params.gameId ?? "")) {
		return <NotFoundCard />;
	}

	return <GameNotFoundCard />;
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
	component: () => <Outlet />,
});

export { Route };
