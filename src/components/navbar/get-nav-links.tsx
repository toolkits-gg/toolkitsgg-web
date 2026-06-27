import type { FC } from "react";
import { BsCollection } from "react-icons/bs";
import { GiCapeArmor, GiLockedChest } from "react-icons/gi";
import type { GameId } from "@/prisma";

type NavLinkSubLink = {
	label: string;
	link?: string;
	onClick?: () => void;
	dataWizardTarget?: string;
};

type NavLinkBase = {
	label: string;
	icon: FC | undefined;
	initiallyOpened: boolean;
	links?: NavLinkSubLink[];
};

type NavLink = NavLinkBase &
	(
		| { url: string; links?: undefined }
		| { url?: undefined; links: NavLinkSubLink[] }
	);

const buildToolkitLinks = (onGettingStartedWizard?: () => void): NavLink[] => [
	{
		label: "Toolkits.gg",
		icon: GiLockedChest,
		initiallyOpened: true,
		links: [
			{
				label: "Home",
				link: "/",
			},
			{
				label: "Getting Started",
				onClick: onGettingStartedWizard,
				dataWizardTarget: "get-started-link",
			},
			{
				label: "Support Toolkits.gg",
				link: "/",
				dataWizardTarget: "support-link",
			},
			{
				label: "Change Log",
				link: "/changelog",
			},
		],
	},
];

const buildItemsNavLink = (gameId: GameId): NavLink => ({
	label: "Items",
	icon: BsCollection,
	initiallyOpened: true,
	links: [
		{
			label: "Item List",
			link: `/${gameId}/items`,
		},
	],
});

const buildBuildsNavLink = (gameId: GameId): NavLink => {
	return {
		label: "Builds",
		icon: GiCapeArmor,
		initiallyOpened: true,
		links: [
			{
				label: "Featured Builds",
				link: `/${gameId}/build/featured`,
			},
			{
				label: "Community Builds",
				link: `/${gameId}/build/community`,
			},
		],
	};
};

type GetNavLinksParams = {
	gameId: GameId | undefined;
	onGettingStartedWizard?: () => void;
};

const getNavLinks = ({
	onGettingStartedWizard,
	gameId,
}: GetNavLinksParams): NavLink[] => {
	const navLinks: NavLink[] = [];
	if (gameId && gameId !== "none") {
		navLinks.push(buildItemsNavLink(gameId));
		navLinks.push(buildBuildsNavLink(gameId));
	}
	navLinks.push(...buildToolkitLinks(onGettingStartedWizard));
	return navLinks;
};

export { getNavLinks, type NavLinkSubLink };
