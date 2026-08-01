import {
	ColorSchemeScript,
	MantineProvider,
	mantineHtmlProps,
	Text,
	Title,
} from "@mantine/core";
import { HeadContent, Scripts } from "@tanstack/react-router";
import { LuGithub, LuWrench } from "react-icons/lu";
import { SiDiscord } from "react-icons/si";
import { AnimatedLogo } from "#/components/AppLogo.tsx";
import { DISCORD_URL, GITHUB_URL } from "#/constants.ts";
import { clientEnv } from "#/env/client-env.ts";
import { defaultTheme } from "#/features/theme/themes/default-theme.ts";
import classes from "./MaintenanceModeDocument.module.css";

/**
 * Full-page shell rendered in place of `RootDocument` when
 * `VITE_ENABLE_MAINTENANCE_MODE` is set.
 *
 * It deliberately renders none of the app: no providers beyond Mantine, no
 * navigation, no data fetching, and no router outlet.
 * Route children are dropped so every path resolves to this page.
 */
export const MaintenanceModeDocument = () => {
	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript forceColorScheme="dark" />
				<HeadContent />
				<title>{`${clientEnv.VITE_APP_NAME} — Under Maintenance`}</title>
				<meta name="robots" content="noindex" />
			</head>
			<body className={classes.body}>
				<MantineProvider
					theme={defaultTheme}
					forceColorScheme="dark"
					deduplicateCssVariables
				>
					<main className={classes.shell}>
						<section className={classes.card}>
							<div className={classes.logo}>
								<AnimatedLogo size={128} />
							</div>

							<span className={classes.badge}>
								<span className={classes.pulse} />
								Maintenance in progress
							</span>

							<Title order={1} className={classes.title}>
								We&rsquo;ll be right back
							</Title>

							<Text c="mutedFg.5">
								{clientEnv.VITE_APP_NAME} is temporarily offline while we ship
								some upgrades. Builds, loadouts, and everything else are safe,
								and will be available again soon.
							</Text>

							<div className={classes.divider} />

							<Text size="sm" c="mutedFg.5" mb="lg">
								Check back shortly, or follow along for updates:
							</Text>

							<div className={classes.links}>
								<a
									className={classes.link}
									href={DISCORD_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									<SiDiscord size={16} />
									Discord
								</a>
								<a
									className={classes.link}
									href={GITHUB_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									<LuGithub size={16} />
									GitHub
								</a>
							</div>
						</section>

						<footer className={classes.footer}>
							<LuWrench
								size={12}
								style={{ verticalAlign: "-1px", marginRight: "0.35rem" }}
							/>
							Toolkits.gg &middot; maintenance mode
						</footer>
					</main>
				</MantineProvider>
				<Scripts />
			</body>
		</html>
	);
};
