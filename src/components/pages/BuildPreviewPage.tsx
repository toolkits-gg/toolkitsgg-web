import { ActionIcon, Button, Group, Tooltip } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useQueryStates } from "nuqs";
import { LuCamera, LuPencil } from "react-icons/lu";
import { NotFoundCard } from "#/components/NotFoundCard";
import { BuildViewLayout } from "#/components/pages/build/build-view/BuildViewLayout";
import { ShareBuildButton } from "#/components/pages/build/build-view/ShareBuildButton";
import type { GameBuildsConfig } from "#/features/game/types";
import { useGameId } from "#/features/game/use-game-id";
import {
	buildDraftParsers,
	buildDraftToSearchParams,
	paramsToDraft,
} from "#/features/search-params/parsers/build-draft";
import { getGameItems } from "#/games-registry/public-registry";

type BuildPreviewPageProps = { builds: GameBuildsConfig };

/**
 * Renders a build that exists only in the URL. This is where a shared link
 * lands, so it has to work with no account, no network round-trip for the
 * build, and nothing stored on the device.
 */
const BuildPreviewPage = ({ builds }: BuildPreviewPageProps) => {
	const gameId = useGameId();
	const navigate = useNavigate();
	const [params] = useQueryStates(buildDraftParsers);
	const draft = paramsToDraft(params);

	// An old link can name items that no longer exist. Showing the rest beats
	// failing the whole build over one retired id.
	const knownItemIds = new Set(
		getGameItems(gameId)?.all.map((item) => item.id),
	);
	const loadout = draft.loadout.filter((entry) =>
		knownItemIds.has(entry.itemId),
	);

	if (loadout.length === 0) {
		return (
			<NotFoundCard
				badge="Build not found"
				heading={<>That build link isn&rsquo;t readable.</>}
				description="The link may have been truncated on its way here. Ask for it again, or start a build of your own."
				footerLabel="404 not found"
			/>
		);
	}

	return (
		<BuildViewLayout
			builds={builds}
			name={draft.name || "Shared build"}
			tags={draft.tags}
			loadout={loadout}
			image={{
				imageUrl: draft.imageUrl,
				imagePosition: draft.imagePosition,
				imageFit: draft.imageFit,
			}}
			videoUrl={draft.videoUrl}
			referenceUrl={draft.referenceUrl}
			build={null}
			renderActions={({ screenshotLoading, onScreenshot }) => (
				<Group gap="xs" wrap="nowrap">
					<ShareBuildButton buildDraft={{ ...draft, loadout }} />

					<Tooltip label="Screenshot">
						<ActionIcon
							variant="subtle"
							aria-label="Screenshot"
							loading={screenshotLoading}
							onClick={onScreenshot}
						>
							<LuCamera size={16} />
						</ActionIcon>
					</Tooltip>

					{gameId !== "none" && (
						<Button
							size="compact-sm"
							variant="light"
							leftSection={<LuPencil size={14} />}
							onClick={() =>
								void navigate({
									to: "/$gameId/build/create",
									params: { gameId },
									search: buildDraftToSearchParams({ ...draft, loadout }),
								})
							}
						>
							Open in build editor
						</Button>
					)}
				</Group>
			)}
		/>
	);
};

export { BuildPreviewPage };
