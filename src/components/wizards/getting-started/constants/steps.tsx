import { Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { SupportButtons } from "#/components/SupportButtons";
import { CODEBERG_URL, DISCORD_URL } from "#/constants.ts";
import type { WizardStep } from "#/features/wizard/types";
import { SocialMediaContent } from "../components/SocialMediaContent";

const GETTING_STARTED_STEPS: WizardStep[] = [
	{
		id: "welcome",
		title: "Welcome to Toolkits.gg!",
		description:
			"Thanks for visiting! This short wizard will help you get acclimated to the site and show you the key features. Let's get started!",
	},
	{
		id: "game-switcher",
		targetSelector: '[data-wizard-target="game-switcher"]',
		title: "Game Switcher",
		description:
			"Use this dropdown to switch between different games. Each game has its own set of tools and features!",
	},
	{
		id: "theme-changer",
		targetSelector: '[data-wizard-target="theme-changer"]',
		title: "Theme Settings",
		description:
			'Click here to customize your theme! You can toggle "Auto change theme on game change" if you prefer to keep one consistent theme across all games instead of using game-specific colors.',
	},
	{
		id: "user-menu",
		targetSelector: '[data-wizard-target="user-menu"]',
		title: "User Account",
		description:
			"We keep as much functionality as possible available without signing in! However, some features that require persistent storage to the database (like saving builds or tracking items across devices) will require you to create an account.",
	},
	{
		id: "social-media",
		targetSelector: '[data-wizard-target="social-media"]',
		title: "Join Our Community!",
		description: "",
		customContent: (
			<>
				<Text
					size="sm"
					mb="sm"
					c="light-dark(var(--mantine-color-cardFg-5), var(--mantine-color-cardFg-2))"
				>
					<Text
						component={Link}
						href={DISCORD_URL}
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: "inherit", textDecoration: "underline" }}
					>
						Join our Discord
					</Text>{" "}
					to submit feature requests, participate in detailed game discussions,
					and become part of a community passionate about great games! This
					project is also totally open-source and ad-free on{" "}
					<Text
						component={Link}
						href={CODEBERG_URL}
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: "inherit", textDecoration: "underline" }}
					>
						GitHub
					</Text>
					. A major goal is to help people make their first open-source
					contributions-check out the repo or message me on Discord to get
					involved!
				</Text>
				<SocialMediaContent />
			</>
		),
	},
	{
		id: "support",
		targetSelector: '[data-wizard-target="support-link"]',
		title: "Support the Project",
		description: "Help keep the site online and ad-free!",
		customContent: <SupportButtons />,
	},
	{
		id: "relaunch",
		targetSelector: '[data-wizard-target="get-started-link"]',
		title: "That's It!",
		description:
			'You can launch this wizard again at any time by clicking the "Getting Started" link here. Happy gaming!',
	},
];

export { GETTING_STARTED_STEPS };
