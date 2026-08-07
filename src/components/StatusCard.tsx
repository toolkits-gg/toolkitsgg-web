import { Text, Title } from "@mantine/core";
import clsx from "clsx";
import type { ReactNode } from "react";
import { LuGithub } from "react-icons/lu";
import { SiDiscord } from "react-icons/si";
import { AnimatedLogo } from "#/components/AppLogo.tsx";
import { CODEBERG_URL, DISCORD_URL } from "#/constants.ts";
import classes from "./StatusCard.module.css";

type StatusCardProps = {
	badge: string;
	heading: ReactNode;
	description: ReactNode;
	actions?: ReactNode;
	linksIntro: string;
	footerIcon: ReactNode;
	footerLabel: string;
	variant: "standalone" | "embedded";
};

export const StatusCard = ({
	badge,
	heading,
	description,
	actions,
	linksIntro,
	footerIcon,
	footerLabel,
	variant,
}: StatusCardProps) => {
	const Shell = variant === "standalone" ? "main" : "div";

	return (
		<Shell
			className={clsx(
				classes.shell,
				variant === "standalone" && classes.shellStandalone,
			)}
		>
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

				{actions ? <div className={classes.actions}>{actions}</div> : null}

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
						href={CODEBERG_URL}
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
		</Shell>
	);
};
