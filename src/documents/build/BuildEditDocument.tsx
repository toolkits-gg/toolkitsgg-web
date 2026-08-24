import { Center, Loader } from "@mantine/core";
import { NotFoundCard } from "#/components/NotFoundCard.tsx";
import { BuildEditor } from "#/documents/build/BuildEditor.tsx";
import { useViewerGrants } from "#/features/auth/use-viewer-grants.ts";
import type { GameBuildsConfig } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import { useEffectiveUserId } from "#/features/sync/identity/use-effective-user-id.ts";

type BuildEditDocumentProps = { builds: GameBuildsConfig; buildId: string };

const BuildEditDocument = ({ builds, buildId }: BuildEditDocumentProps) => {
	const viewer = useEffectiveUserId();
	const gameId = useGameId();
	const { can } = useViewerGrants();
	const { data: build, isLoading } = builds.data.builds.useById(buildId);

	if (isLoading) {
		return (
			<Center py="xl">
				<Loader />
			</Center>
		);
	}

	// Compared against the effective id so an anonymous
	// author still owns the builds they made on this device.
	const isOwner = build?.createdById === viewer.id;
	const asModerator = !isOwner && can("build:moderate", gameId);

	if (!build || (!isOwner && !asModerator)) {
		return (
			<NotFoundCard
				badge="Build not found"
				heading={<>That build isn&rsquo;t available.</>}
				description="It may have been deleted, or you may not have permission to edit it."
				footerLabel="404 not found"
			/>
		);
	}

	return (
		// The editor seeds its fields from `build` once per mount. Switching between
		// two builds on this route keeps the same instance whenever the destination
		// is already cached, so without the key the fields would stay on the build
		// that was left behind and the next save would write them onto this one.
		<BuildEditor
			key={build.id}
			builds={builds}
			build={build}
			heading={asModerator ? "Edit build (moderator)" : "Edit build"}
			asModerator={asModerator}
		/>
	);
};

export { BuildEditDocument };
