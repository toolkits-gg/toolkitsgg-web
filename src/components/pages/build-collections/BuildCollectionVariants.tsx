import { Button, Center, Group, Loader, Select, Stack } from "@mantine/core";
import { createId } from "@paralleldrive/cuid2";
import { useNavigate } from "@tanstack/react-router";
import { parseAsString, useQueryState } from "nuqs";
import { LuCopyPlus } from "react-icons/lu";
import { NotFoundCard } from "#/components/NotFoundCard";
import { BuildActions } from "#/components/pages/build/build-view/BuildActions";
import { BuildViewLayout } from "#/components/pages/build/build-view/BuildViewLayout";
import { toBuildImageValue } from "#/features/build-image/build-image-value";
import type { BuildCollectionRecord } from "#/features/game/data/types";
import type { GameBuildsConfig } from "#/features/game/types";
import { useGameId } from "#/features/game/use-game-id";
import { useEffectiveUserId } from "#/features/sync/identity/use-effective-user-id";

type BuildCollectionVariantsProps = {
	builds: GameBuildsConfig;
	collection: BuildCollectionRecord;
	isOwner: boolean;
};

/**
 * The VARIANTS layout: one build rendered on the read-only builder surface with
 * a switcher above it, for collections whose builds are versions of each other.
 */
const BuildCollectionVariants = ({
	builds,
	collection,
	isOwner,
}: BuildCollectionVariantsProps) => {
	const gameId = useGameId();
	const navigate = useNavigate();
	const viewer = useEffectiveUserId();
	const [variantId, setVariantId] = useQueryState("variant", parseAsString);
	const duplicate = builds.data.builds.useDuplicate();

	const selectedId =
		collection.builds.find((build) => build.id === variantId)?.id ??
		collection.builds[0]?.id ??
		"";

	const { data: build, isLoading } = builds.data.builds.useById(selectedId);

	const options = collection.builds.map((member, index) => ({
		value: member.id,
		label: index === 0 ? `${member.name} (primary)` : member.name,
	}));

	return (
		<Stack gap="md">
			<Group justify="space-between" align="flex-end" wrap="nowrap">
				<Select
					label="Variant"
					data={options}
					value={selectedId}
					allowDeselect={false}
					onChange={(next) => next && setVariantId(next)}
					w={280}
				/>
				{isOwner && selectedId && (
					<Button
						variant="default"
						leftSection={<LuCopyPlus size={16} />}
						loading={duplicate.isPending}
						onClick={() =>
							void duplicate
								.mutateAsync({
									sourceBuildId: selectedId,
									newBuildId: createId(),
									collectionId: collection.id,
								})
								.then((copy) => {
									if (gameId === "none") return;
									return navigate({
										to: "/$gameId/build/$buildId/edit",
										params: { gameId, buildId: copy.id },
									});
								})
								// The mutation already surfaces a notification.
								.catch(() => {})
						}
					>
						Add variant
					</Button>
				)}
			</Group>

			{isLoading ? (
				<Center py="xl">
					<Loader />
				</Center>
			) : build ? (
				<BuildViewLayout
					builds={builds}
					name={build.name}
					description={build.description}
					visibility={build.visibility}
					tags={build.tags}
					loadout={build.loadout}
					image={toBuildImageValue(build)}
					videoUrl={build.videoUrl}
					referenceUrl={build.referenceUrl}
					build={build}
					renderActions={({ screenshotLoading, onScreenshot }) => (
						<BuildActions
							build={build}
							builds={builds}
							isOwner={!!build.createdById && build.createdById === viewer.id}
							isAuthed={viewer.kind === "auth"}
							screenshotLoading={screenshotLoading}
							onScreenshot={onScreenshot}
						/>
					)}
				/>
			) : (
				<NotFoundCard
					badge="Variant not available"
					heading={<>That variant isn&rsquo;t available.</>}
					description="It may have been deleted, or its owner may have made it private."
					footerLabel="404 not found"
				/>
			)}
		</Stack>
	);
};

export { BuildCollectionVariants };
