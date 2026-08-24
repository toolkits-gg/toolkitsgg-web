import {
	Center,
	EmptyState,
	Group,
	Loader,
	SegmentedControl,
	SimpleGrid,
	Stack,
	Title,
} from "@mantine/core";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { BuildCard } from "#/documents/build/BuildCard.tsx";
import { AddToCollectionMenu } from "#/documents/build/build-view/AddToCollectionMenu.tsx";
import type { BuildFeedSort } from "#/features/game/data/types.ts";
import { COMMUNITY_FEED } from "#/features/game/data/utils.ts";
import type { GameBuildsConfig } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

type BuildFeedPageProps = {
	builds: GameBuildsConfig;
	heading: string;
	/** A curated feed name, or `COMMUNITY_FEED` for the sortable all-public listing. */
	feed: string;
};

const SORT_VALUES = ["recent", "popular"] as const;

const SORT_OPTIONS = [
	{ value: "recent", label: "Newest" },
	{ value: "popular", label: "Most upvoted" },
];

/** Shared listing for both the curated feeds and the community build list. */
const BuildFeedPage = ({ builds, heading, feed }: BuildFeedPageProps) => {
	const gameId = useGameId();
	const isCommunity = feed === COMMUNITY_FEED;
	const [sort, setSort] = useQueryState(
		"sort",
		parseAsStringLiteral(SORT_VALUES).withDefault("recent"),
	);

	const feedQuery = builds.data.feeds.useFeed(feed, sort);
	const list = feedQuery.data ?? [];

	return (
		<Stack gap="md" p="md">
			<Group justify="space-between" wrap="nowrap">
				<Title order={2}>{heading}</Title>
				{isCommunity && (
					<SegmentedControl
						data={SORT_OPTIONS}
						value={sort}
						onChange={(next) => void setSort(next as BuildFeedSort)}
					/>
				)}
			</Group>

			{feedQuery.isLoading ? (
				<Center py="xl">
					<Loader />
				</Center>
			) : list.length === 0 ? (
				<EmptyState
					title="No builds here yet"
					description={
						isCommunity
							? "Be the first to publish a build for this game."
							: "Nothing has been added to this feed yet."
					}
				/>
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
					{list.map((build) => (
						<BuildCard
							key={build.id}
							build={build}
							gameId={gameId}
							showVisibility={false}
							actions={
								<AddToCollectionMenu
									build={build}
									collections={builds.data.collections}
									viewerOwnsBuild={false}
								/>
							}
						/>
					))}
				</SimpleGrid>
			)}
		</Stack>
	);
};

export { BuildFeedPage };
