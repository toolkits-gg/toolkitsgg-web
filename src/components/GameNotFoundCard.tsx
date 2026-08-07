import { NotFoundCard } from "#/components/NotFoundCard.tsx";

export const GameNotFoundCard = () => {
	return (
		<NotFoundCard
			badge="Game not found"
			heading={<>We don&rsquo;t have that game.</>}
			description={
				<>
					That URL doesn&rsquo;t match a game we support. Use the game switcher
					in the header to jump to one that we do.
				</>
			}
			footerLabel="404 game not found"
		/>
	);
};
