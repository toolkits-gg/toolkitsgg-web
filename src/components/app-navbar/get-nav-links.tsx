import type { FC } from "react";
import { BsCollection } from "react-icons/bs";
import { GiCapeArmor, GiLockedChest } from "react-icons/gi";
import { LuHouse, LuImage } from "react-icons/lu";
import { gameSupportsBuilds } from "#/games-registry/builds-registry";
import {
	gameHasWallpapers,
	getGameMetadata,
} from "#/games-registry/public-registry";
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
				label: "Toolkits Home",
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
		// Game-specific home page
		navLinks.push({
			label: getGameMetadata(gameId)?.label ?? gameId,
			icon: LuHouse,
			initiallyOpened: true,
			links: [
				{
					label: "Home",
					link: `/${gameId}`,
				},
			],
		});
		navLinks.push({
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

		if (gameSupportsBuilds(gameId)) {
			navLinks.push({
				label: "Builds",
				icon: GiCapeArmor,
				initiallyOpened: true,
				links: [
					{
						label: "Create Build",
						link: `/${gameId}/build/create`,
					},
					{
						label: "Featured Builds",
						link: `/${gameId}/build/featured`,
					},
					{
						label: "Community Builds",
						link: `/${gameId}/build/community`,
					},
				],
			});
		}
		if (gameHasWallpapers(gameId)) {
			navLinks.push({
				label: "Wallpapers",
				icon: LuImage,
				initiallyOpened: true,
				links: [
					{
						label: "Browse Wallpapers",
						link: `/${gameId}/wallpapers`,
					},
				],
			});
		}
	}
	navLinks.push(...buildToolkitLinks(onGettingStartedWizard));
	return navLinks;
};

export { getNavLinks, type NavLinkSubLink };
