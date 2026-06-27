import type {
	CollectItemInput,
	GameCollectedItemsData,
} from "#/features/game/data/types.ts";
import type { CollectedItemsViewMode } from "#/features/game/types.ts";

type UseCollectedItemsArgs = {
	data: GameCollectedItemsData;
	viewMode?: CollectedItemsViewMode;
};

type UseCollectedItemsResult = {
	collectedIds: string[];
	isPublicView: boolean;
	handleCollect: (input: CollectItemInput) => void;
	handleUncollect: (input: CollectItemInput) => void;
};

const useCollectedItems = ({
	data,
	viewMode,
}: UseCollectedItemsArgs): UseCollectedItemsResult => {
	const isPublicView = viewMode?.kind === "public";
	const publicUserId = viewMode?.kind === "public" ? viewMode.userId : null;

	const selfQuery = data.useList();
	const publicQuery = data.usePublicList(publicUserId);

	const collectedData = isPublicView ? publicQuery.data : selfQuery.data;
	const collectedIds = (collectedData ?? []).map((r) => r.itemId);

	const { mutate: collect } = data.useCollect();
	const { mutate: uncollect } = data.useUncollect();

	const handleCollect = ({ itemId, itemName }: CollectItemInput) =>
		collect({ itemId, itemName });

	const handleUncollect = ({ itemId, itemName }: CollectItemInput) =>
		uncollect({ itemId, itemName });

	return { collectedIds, isPublicView, handleCollect, handleUncollect };
};

export type { UseCollectedItemsArgs, UseCollectedItemsResult };
export { useCollectedItems };
