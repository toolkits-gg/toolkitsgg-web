import {
	ColorSchemeScript,
	MantineProvider,
	mantineHtmlProps,
} from "@mantine/core";
import { HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { StatusCard } from "#/components/StatusCard.tsx";
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
					<StatusCard
						variant="standalone"
						badge={badge}
						heading={heading}
						description={description}
						linksIntro={linksIntro}
						footerIcon={footerIcon}
						footerLabel={footerLabel}
					/>
				</MantineProvider>
				<Scripts />
			</body>
		</html>
	);
};
