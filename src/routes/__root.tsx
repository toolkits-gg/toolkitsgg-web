import "@mantine/core/styles.layer.css";
// ‼️ import carousel and notifications styles after core package styles
import "@mantine/carousel/styles.layer.css";
import "@mantine/notifications/styles.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import {
	AppShell,
	Box,
	Burger,
	ColorSchemeScript,
	Divider,
	Flex,
	Group,
	mantineHtmlProps,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	ClientOnly,
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { DefaultLogo } from "#/components/AppLogo";
import { AppProviders } from "#/components/AppProviders";
import { AppNavbar } from "#/components/navigation/AppNavbar";
import { SocialMedia } from "#/components/SocialMedia";
import { GettingStartedWizard } from "#/components/wizards/getting-started/components/GettingStartedWizard";
import { useGettingStartedWizard } from "#/components/wizards/getting-started/hooks/use-getting-started-wizard";
import { OG_IMAGE, SERVER_GAME_INPUTS_QUERY_KEY } from "#/constants";
import { GameSwitcher } from "#/features/game/core/GameSwitcher";
import { getServerResolvedGameInputsServerFn } from "#/features/game/dal/active-game";
import { getValidatedGameId } from "#/features/game/registry/game-registry";
import type { GameId } from "@/prisma";
import classes from "./Root.module.css";

interface MyRouterContext {
	queryClient: QueryClient;
}

const title = "Toolkits.gg";
const description =
	"An open-source and ad-free platform providing item collection management, build planning and sharing, and more for a variety of games.";
const url = "https://toolkits.gg";

const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async ({ context, location }) => {
		// Cache the server-fn result for the lifetime of the session — the Host
		// header and the active-game cookie don't change without a hard reload.
		const { subdomainGameId, cookieGameId } =
			await context.queryClient.ensureQueryData({
				queryKey: SERVER_GAME_INPUTS_QUERY_KEY,
				queryFn: () => getServerResolvedGameInputsServerFn(),
				staleTime: Number.POSITIVE_INFINITY,
				gcTime: Number.POSITIVE_INFINITY,
			});

		const searchParams = new URLSearchParams(location.searchStr);
		const devOverride = import.meta.env.DEV
			? (getValidatedGameId(searchParams.get("_game") ?? "") ?? null)
			: null;
		const firstSeg = location.pathname.split("/").filter(Boolean)[0] ?? "";
		const routeGameId = getValidatedGameId(firstSeg) ?? null;
		const searchGameId =
			getValidatedGameId(searchParams.get("gameId") ?? "") ?? null;

		const ssrGameId: GameId | null =
			subdomainGameId ??
			devOverride ??
			routeGameId ??
			searchGameId ??
			cookieGameId ??
			null;

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
	shellComponent: RootDocument,
	notFoundComponent: () => {
		return (
			<Box p="md">
				<Title order={1}>404 - Not Found</Title>
				<Text>The page you are looking for does not exist.</Text>
			</Box>
		);
	},
});

function RootDocument({ children }: { children: ReactNode }) {
	const [navbarOpened, { toggle: toggleNavbar }] = useDisclosure();

	const { openWizard, closeWizard, setCurrentWizardStepId, wizardOpened } =
		useGettingStartedWizard();

	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
				<script
					suppressHydrationWarning
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <needed for hydration issue with next-themes>
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('theme');var s;if(t&&t!=='system'){document.documentElement.setAttribute('data-theme',t);s=t.endsWith('-light')?'light':'dark';}else{var d=window.matchMedia('(prefers-color-scheme: dark)').matches;s=d?'dark':'light';document.documentElement.setAttribute('data-theme','default-'+s);}document.documentElement.setAttribute('data-mantine-color-scheme',s);}catch(e){}})();`,
					}}
				/>
				<HeadContent />
				<title>{title}</title>
			</head>
			<body
				style={{
					color: `var(--mantine-color-baseFg-5)`,
					backgroundColor: `var(--mantine-color-base-5)`,
					fontFamily: `'Geist', sans-serif`,
				}}
			>
				<AppProviders>
					<AppShell
						padding="md"
						header={{ height: 60 }}
						footer={{ height: 48 }}
						navbar={{
							width: 300,
							breakpoint: "sm",
							collapsed: { mobile: !navbarOpened },
						}}
					>
						<AppShell.Header px="sm" className={classes.header}>
							<Group h="100%" justify="space-between">
								<Flex justify="start" align="center">
									<Burger
										opened={navbarOpened}
										onClick={toggleNavbar}
										hiddenFrom="sm"
										size="sm"
										color="var(--mantine-color-primary-4)"
									/>
								</Flex>

								<Flex flex={1} align="center" justify="center" gap="xs">
									<GameSwitcher />
								</Flex>

								<Flex justify="end" align="center">
									{/* <NotificationBellMenu /> */}
								</Flex>
							</Group>
						</AppShell.Header>

						<AppShell.Navbar className={classes.navbar}>
							<AppNavbar onGettingStartedWizard={openWizard} />
						</AppShell.Navbar>

						<AppShell.Main className={classes.main}>{children}</AppShell.Main>

						<AppShell.Footer p="xs" className={classes.footer}>
							<Flex justify="center" align="center" gap="sm" wrap="wrap">
								<DefaultLogo size={24} />
								<ClientOnly>
									<Text size="xs" c="dimmed">
										© {new Date().getFullYear()} Toolkits.gg
									</Text>
								</ClientOnly>
								<Divider orientation="vertical" />
								<SocialMedia />
							</Flex>
						</AppShell.Footer>
						<GettingStartedWizard
							opened={wizardOpened}
							onClose={closeWizard}
							navbarOpened={navbarOpened}
							toggleNavbar={toggleNavbar}
							onStepChange={setCurrentWizardStepId}
						/>
					</AppShell>
				</AppProviders>

				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

export { Route, type SERVER_GAME_INPUTS_QUERY_KEY };
