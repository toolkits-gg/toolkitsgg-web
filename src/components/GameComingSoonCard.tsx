import { Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { LuRocket } from "react-icons/lu";
import { StatusCard } from "#/components/StatusCard";
import { getGameMetadata } from "#/games-registry/public-registry";

type GameComingSoonCardProps = {
	gameId: string;
};

/**
 * Shown for a registered game that has no items yet, in place of an empty item
 * list. The site-wide `VITE_SHOW_COMING_SOON` shell in `__root.tsx` cannot
 * express this, since it blocks every game at once.
 */
export const GameComingSoonCard = ({ gameId }: GameComingSoonCardProps) => {
	const label = getGameMetadata(gameId)?.label ?? gameId;

	return (
		<StatusCard
			variant="embedded"
			badge="Coming soon"
			heading={<>{label} isn&rsquo;t ready yet.</>}
			description={
				<>
					We&rsquo;re still building out the {label} toolkit. It&rsquo;ll show
					up here as soon as there&rsquo;s something worth collecting.
				</>
			}
			actions={
				<Button component={Link} to="/" size="md">
					Browse other games
				</Button>
			}
			linksIntro="Want to help or get updates?"
			footerIcon={<LuRocket size={12} />}
			footerLabel="coming soon"
		/>
	);
};
