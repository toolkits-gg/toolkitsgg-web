import { Flex, ScrollArea } from "@mantine/core";
import { ClientOnly } from "@tanstack/react-router";
import { getNavLinks } from "#/components/navigation/get-nav-links";
import { NavbarLinksGroup } from "#/components/navigation/NavbarLinksGroup";
import { UserMenu } from "#/features/auth/UserMenu.tsx";
import { useGameId } from "#/features/game/use-game-id.ts";
import { ChangeThemeButton } from "#/features/theme/ChangeThemeButton.tsx";
import classes from "./AppNavbar.module.css";

type AppNavbarProps = {
	onGettingStartedWizard: () => void;
};

const AppNavbar = ({ onGettingStartedWizard }: AppNavbarProps) => {
	const gameId = useGameId();

	const navLinks = getNavLinks({
		gameId,
		onGettingStartedWizard,
	});

	return (
		<Flex
			component="nav"
			w={{ base: 350, sm: 300 }}
			className={classes.navbarInner}
		>
			<ScrollArea className={classes.scrollArea}>
				<div className={classes.scrollAreaContent}>
					{navLinks.map((navLink) => (
						<NavbarLinksGroup {...navLink} key={navLink.label} />
					))}
				</div>
			</ScrollArea>

			<Flex className={classes.themeChangerWrapper}>
				<ChangeThemeButton gameId="none" />
			</Flex>

			<ClientOnly fallback={<Flex className={classes.userMenuWrapper} />}>
				<Flex className={classes.userMenuWrapper}>
					<UserMenu />
				</Flex>
			</ClientOnly>
		</Flex>
	);
};

export { AppNavbar };
