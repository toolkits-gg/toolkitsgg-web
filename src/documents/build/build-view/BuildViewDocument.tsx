import { Center, Loader } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { NotFoundCard } from "#/components/NotFoundCard.tsx";
import { BuildActions } from "#/documents/build/build-view/BuildActions.tsx";
import { BuildViewLayout } from "#/documents/build/build-view/BuildViewLayout.tsx";
import { toBuildImageValue } from "#/features/build-image/build-image-value.ts";
import type { GameBuildsConfig } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id.ts";
import { useEffectiveUserId } from "#/features/sync/identity/use-effective-user-id.ts";

type BuildViewDocumentProps = { builds: GameBuildsConfig; buildId: string };

const BuildViewDocument = ({ builds, buildId }: BuildViewDocumentProps) => {
	const gameId = useGameId();
	const navigate = useNavigate();
	const viewer = useEffectiveUserId();
	const { data: build, isLoading } = builds.data.builds.useById(buildId);

	const recordView = builds.data.builds.useRecordView();
	const viewRecordedRef = useRef<string | null>(null);
	useEffect(() => {
		if (!build || viewRecordedRef.current === build.id) return;
		viewRecordedRef.current = build.id;
		recordView.mutate({
			buildId: build.id,
			viewerKey: getOrCreateAnonUserId(),
		});
	}, [build, recordView]);

	// A variant set is one logical build with one canonical URL, so a link to a
	// member resolves to the set. `variantSet` is only present when the viewer may
	// see the set, so a public build inside a private set still renders here.
	const variantSet = build?.variantSet;
	useEffect(() => {
		if (!variantSet || gameId === "none") return;
		void navigate({
			to: "/$gameId/build-collection/$collectionId",
			params: { gameId, collectionId: variantSet.collectionId },
			search: { variant: buildId },
			replace: true,
		});
	}, [variantSet, gameId, buildId, navigate]);

	if (isLoading) {
		return (
			<Center py="xl">
				<Loader />
			</Center>
		);
	}

	if (!build) {
		return (
			<NotFoundCard
				badge="Build not found"
				heading={<>That build isn&rsquo;t available.</>}
				description="It may have been deleted, or its owner may have made it private."
				footerLabel="404 not found"
			/>
		);
	}

	// Compared against the effective id, not the session: an anonymous author owns
	// their device-local builds and must still be able to edit and delete them.
	const isOwner = !!build.createdById && build.createdById === viewer.id;

	return (
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
					isOwner={isOwner}
					isAuthed={viewer.kind === "auth"}
					screenshotLoading={screenshotLoading}
					onScreenshot={onScreenshot}
				/>
			)}
		/>
	);
};

export { BuildViewDocument };
