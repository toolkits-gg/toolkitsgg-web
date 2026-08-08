import type {
	BuildCollectionSummary,
	GameBuildCollectionsData,
} from "#/features/game/data/types";
import type { ProfileTabViewMode } from "#/features/game/types";

type UseBuildCollectionsArgs = {
	data: GameBuildCollectionsData;
	viewMode: ProfileTabViewMode;
};

type UseBuildCollectionsResult = {
	collections: BuildCollectionSummary[];
	isLoading: boolean;
	isPublicView: boolean;
};

/**
 * Reads build collections for either the signed-in owner (local/remote) or, on a
 * public profile, another user's publicly-visible collections via the server fn.
 * Mirrors use-created-builds so both profile tabs behave consistently.
 */
const useBuildCollections = ({
	data,
	viewMode,
}: UseBuildCollectionsArgs): UseBuildCollectionsResult => {
	const isPublicView = viewMode.kind === "public";
	const publicUserId = viewMode.kind === "public" ? viewMode.userId : null;

	const selfQuery = data.useList();
	const publicQuery = data.usePublicList(publicUserId);

	const activeQuery = isPublicView ? publicQuery : selfQuery;

	return {
		collections: activeQuery.data ?? [],
		isLoading: activeQuery.isLoading,
		isPublicView,
	};
};

export type { UseBuildCollectionsArgs, UseBuildCollectionsResult };
export { useBuildCollections };
