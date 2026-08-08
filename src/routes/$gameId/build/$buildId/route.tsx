import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { gameSupportsBuilds } from "#/games-registry/builds-registry";

/**
 * Layout only. The build view lives in `index.tsx` so the `edit` child route can
 * actually render through this Outlet.
 */
export const Route = createFileRoute("/$gameId/build/$buildId")({
	beforeLoad: ({ params }) => {
		if (!gameSupportsBuilds(params.gameId)) throw notFound();
	},
	component: () => <Outlet />,
});
