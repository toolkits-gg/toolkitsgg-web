import { createFileRoute, notFound } from "@tanstack/react-router";
import { BuildCollectionView } from "#/components/pages/build-collections/BuildCollectionView";
import {
	gameSupportsBuilds,
	getGameBuilds,
} from "#/games-registry/builds-registry";
import { isRegisteredGameId } from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";

/**
 * `variant` is read through nuqs by the variants layout, but it is declared here
 * too so links can target a specific variant type-safely. `gameId` rides along
 * because ShareLinkButton appends it to shared collection links.
 */
type BuildCollectionSearch = { gameId?: GameId; variant?: string };

const ViewBuildCollection = () => {
	const { gameId, collectionId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <BuildCollectionView builds={builds} collectionId={collectionId} />;
};

export const Route = createFileRoute("/$gameId/build-collection/$collectionId")(
	{
		validateSearch: (
			search: Record<string, unknown>,
		): BuildCollectionSearch => {
			const out: BuildCollectionSearch = {};
			if (
				typeof search.gameId === "string" &&
				isRegisteredGameId(search.gameId)
			)
				out.gameId = search.gameId;
			if (typeof search.variant === "string" && search.variant !== "")
				out.variant = search.variant;
			return out;
		},
		beforeLoad: ({ params }) => {
			if (!gameSupportsBuilds(params.gameId)) throw notFound();
		},
		component: ViewBuildCollection,
	},
);
