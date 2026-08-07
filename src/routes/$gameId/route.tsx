import {
	createFileRoute,
	notFound,
	Outlet,
	useParams,
} from "@tanstack/react-router";
import { NotFoundCard } from "#/components/NotFoundCard.tsx";
import { getValidatedGameId } from "#/registry/game-public-registry.tsx";

const GameNotFound = () => {
	const params = useParams({ strict: false });

	if (getValidatedGameId(params.gameId ?? "")) {
		return <NotFoundCard />;
	}

	return (
		<NotFoundCard
			badge="Game not found"
			heading={<>We don&rsquo;t have that game.</>}
			description={
				<>
					That URL doesn&rsquo;t match a game we support. Use the game switcher
					in the header to jump to one that we do.
				</>
			}
			footerLabel="404 game not found"
		/>
	);
};

const Route = createFileRoute("/$gameId")({
	beforeLoad: ({ params }) => {
		if (!getValidatedGameId(params.gameId)) throw notFound();
	},
	head: ({ params }) => ({
		links: [
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
