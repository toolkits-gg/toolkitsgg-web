import {
	AppShell,
	Burger,
	ColorSchemeScript,
	Divider,
	Flex,
	Group,
	mantineHtmlProps,
	Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ClientOnly, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { PropsWithChildren } from "react";
import { DefaultLogo } from "#/components/AppLogo.tsx";
import { AppProviders } from "#/components/AppProviders.tsx";
import { AppNavbar } from "#/components/navbar/AppNavbar.tsx";
import { SocialMedia } from "#/components/SocialMedia.tsx";
import { GettingStartedWizard } from "#/components/wizards/getting-started/components/GettingStartedWizard.tsx";
import { useGettingStartedWizard } from "#/components/wizards/getting-started/hooks/use-getting-started-wizard.ts";
import { clientEnv } from "#/env/client-env.ts";
import { GameSwitcher } from "#/features/game/GameSwitcher.tsx";
import classes from "./RootDocument.module.css";

export const RootDocument = ({ children }: PropsWithChildren) => {
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
				<title>{clientEnv.VITE_APP_NAME}</title>
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
};
