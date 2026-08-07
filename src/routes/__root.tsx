import "@mantine/core/styles.layer.css";
// ‼️ import carousel and notifications styles after core package styles
import "@mantine/carousel/styles.layer.css";
import "@mantine/notifications/styles.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { ComingSoonDocument } from "#/components/ComingSoonDocument.tsx";
import { MaintenanceModeDocument } from "#/components/MaintenanceModeDocument.tsx";
import { NotFoundCard } from "#/components/NotFoundCard.tsx";
import { RootDocument } from "#/components/RootDocument.tsx";
import { OG_IMAGE, SERVER_RESOLVED_GAME_ID_SOURCES } from "#/constants";
import { clientEnv } from "#/env/client-env.ts";
import { getServerResolvedGameInputsServerFn } from "#/features/game/active-game";
import { getValidatedGameId } from "#/game-registry/public-registry.ts";
import type { GameId } from "@/prisma";

interface MyRouterContext {
	queryClient: QueryClient;
}

const title = clientEnv.VITE_APP_NAME;
const description = clientEnv.VITE_APP_DESCRIPTION;
const url = clientEnv.VITE_APP_URL;

const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async ({ context, location }) => {
		// Cache the server-fn result for the lifetime of the session - the
		// active-game cookie doesn't change without a hard reload or setActiveGameCookie
		const { cookieGameId } = await context.queryClient.ensureQueryData({
			queryKey: SERVER_RESOLVED_GAME_ID_SOURCES,
			queryFn: () => getServerResolvedGameInputsServerFn(),
			staleTime: Number.POSITIVE_INFINITY,
			gcTime: Number.POSITIVE_INFINITY,
		});

		const searchParams = new URLSearchParams(location.searchStr);
		const devOverride = import.meta.env.DEV
			? (getValidatedGameId(searchParams.get("_game") ?? "") ?? null)
			: null;
		// On a game subdomain this segment is the one the router rewrite added,
		// so the subdomain reaches the chain through the URL like any other source.
		const firstSeg = location.pathname.split("/").filter(Boolean)[0] ?? "";
		const routeGameId = getValidatedGameId(firstSeg) ?? null;
		const searchGameId =
			getValidatedGameId(searchParams.get("gameId") ?? "") ?? null;

		const ssrGameId: GameId | null =
			routeGameId ?? devOverride ?? searchGameId ?? cookieGameId ?? null;

		return { ssrGameId };
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:image", content: OG_IMAGE },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: url },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: "Toolkits.gg" },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: OG_IMAGE },
			{ name: "twitter:url", content: url },
		],
		links: [
			{
				rel: "icon",
				type: "image/x-icon",
				href: "/favicons/default/favicon.ico",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicons/default/favicon-32x32.png",
			},
			{
				rel: "apple-touch-icon",
				href: "/favicons/default/apple-touch-icon.png",
			},
		],
	}),
	// Maintenance wins over coming soon: if the site is down while still
	// pre-launch, the outage is the more accurate message.
	shellComponent: clientEnv.VITE_ENABLE_MAINTENANCE_MODE
		? MaintenanceModeDocument
		: clientEnv.VITE_SHOW_COMING_SOON
			? ComingSoonDocument
			: RootDocument,
	notFoundComponent: () => <NotFoundCard />,
});

export { Route };
