import { createFileRoute, notFound } from "@tanstack/react-router";
import { WallpaperGalleryPage } from "#/components/pages/WallpaperGalleryPage.tsx";
import {
	gameHasWallpapers,
	getValidatedGameId,
} from "#/games-registry/public-registry";

const Wallpapers = () => {
	const { gameId } = Route.useParams();
	const validated = getValidatedGameId(gameId);
	if (!validated) return null;
	return <WallpaperGalleryPage gameId={validated} />;
};

export const Route = createFileRoute("/$gameId/wallpapers")({
	beforeLoad: ({ params }) => {
		if (!gameHasWallpapers(params.gameId)) throw notFound();
	},
	component: Wallpapers,
});
