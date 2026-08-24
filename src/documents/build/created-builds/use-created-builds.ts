import type {
	CreatedBuildSummary,
	GameCreatedBuildsData,
} from "#/features/game/data/types.ts";
import type { ProfileTabViewMode } from "#/features/game/types.ts";

type UseCreatedBuildsArgs = {
	data: GameCreatedBuildsData;
	viewMode: ProfileTabViewMode;
};

type UseCreatedBuildsResult = {
	builds: CreatedBuildSummary[];
	isLoading: boolean;
	isPublicView: boolean;
};

/**
 * Reads created builds for either the signed-in owner (local/remote) or, on a
 * public profile, another user's publicly-visible builds via the server fn.
 * Mirrors use-collected-items so both profile tabs behave consistently.
 */
const useCreatedBuilds = ({
	data,
	viewMode,
}: UseCreatedBuildsArgs): UseCreatedBuildsResult => {
	const isPublicView = viewMode.kind === "public";
	const publicUserId = viewMode.kind === "public" ? viewMode.userId : null;

	const selfQuery = data.useList();
	const publicQuery = data.usePublicList(publicUserId);

	const activeQuery = isPublicView ? publicQuery : selfQuery;

	return {
		builds: activeQuery.data ?? [],
		isLoading: activeQuery.isLoading,
		isPublicView,
	};
};

export type { UseCreatedBuildsArgs, UseCreatedBuildsResult };
export { useCreatedBuilds };
