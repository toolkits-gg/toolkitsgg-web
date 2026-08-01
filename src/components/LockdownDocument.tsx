import {
	ColorSchemeScript,
	MantineProvider,
	mantineHtmlProps,
	Text,
	Title,
} from "@mantine/core";
import { HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LuGithub } from "react-icons/lu";
import { SiDiscord } from "react-icons/si";
import { AnimatedLogo } from "#/components/AppLogo.tsx";
import { DISCORD_URL, GITHUB_URL } from "#/constants.ts";
import { clientEnv } from "#/env/client-env.ts";
import { defaultTheme } from "#/features/theme/themes/default-theme.ts";
import classes from "./LockdownDocument.module.css";

type LockdownDocumentProps = {
	/** Appended to the app name in the document title. */
	documentTitle: string;
	/** Short status text shown in the pill above the heading. */
	badge: string;
	heading: ReactNode;
	description: ReactNode;
	/** Line introducing the Discord/GitHub links. */
	linksIntro: string;
	footerIcon: ReactNode;
	footerLabel: string;
};

/**
 * Full-page shell used to lock the site down behind a single static message.
 *
 * It deliberately renders none of the app: no providers beyond Mantine, no
 * navigation, no data fetching, and no router outlet.
 * Route children are dropped so every path resolves to this page.
 *
 * @see MaintenanceModeDocument
 * @see ComingSoonDocument
 */
export const LockdownDocument = ({
	documentTitle,
	badge,
	heading,
	description,
	linksIntro,
	footerIcon,
	footerLabel,
}: LockdownDocumentProps) => {
	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript forceColorScheme="dark" />
				{/* Must precede `HeadContent`: the root route also emits a <title>,
				    and the browser honors whichever comes first. */}
				<title>{`${clientEnv.VITE_APP_NAME} — ${documentTitle}`}</title>
				<meta name="robots" content="noindex" />
				<HeadContent />
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
								{badge}
							</span>

							<Title order={1} className={classes.title}>
								{heading}
							</Title>

							<Text c="mutedFg.5">{description}</Text>

							<div className={classes.divider} />

							<Text size="sm" c="mutedFg.5" mb="lg">
								{linksIntro}
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
							<span className={classes.footerIcon}>{footerIcon}</span>
							Toolkits.gg &middot; {footerLabel}
						</footer>
					</main>
				</MantineProvider>
				<Scripts />
			</body>
		</html>
	);
};
