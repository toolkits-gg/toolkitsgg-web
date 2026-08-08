import { Flex, ScrollArea } from "@mantine/core";
import { ClientOnly } from "@tanstack/react-router";
import { getNavLinks } from "#/components/app-navbar/get-nav-links";
import { NavbarLinksGroup } from "#/components/app-navbar/NavbarLinksGroup";
import { useGameId } from "#/features/game/use-game-id";
import { ChangeThemeButton } from "#/features/theme/ChangeThemeButton";
import { UserMenu } from "#/features/user/UserMenu";
import classes from "./AppNavbar.module.css";

type AppNavbarProps = {
	onGettingStartedWizard: () => void;
	onNavigate: () => void;
};

const AppNavbar = ({ onGettingStartedWizard, onNavigate }: AppNavbarProps) => {
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
						<NavbarLinksGroup
							{...navLink}
							onNavigate={onNavigate}
							key={navLink.label}
						/>
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
