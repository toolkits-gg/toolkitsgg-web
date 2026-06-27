import { useQuery } from "@tanstack/react-query";
import { useDalMutation } from "#/features/dal/use-dal-mutation.ts";
import { useDalQuery } from "#/features/dal/use-dal-query.ts";
import type {CollectItemInput, GameCollectedItemsDal} from "#/features/game/dal/types.ts";
import type {CollectedItemsViewMode} from "#/features/game/types.ts";

type UseCollectedItemsArgs = {
	dal: GameCollectedItemsDal;
	viewMode?: CollectedItemsViewMode;
};

type UseCollectedItemsResult = {
	collectedIds: string[];
	isPublicView: boolean;
	handleCollect: (input: CollectItemInput) => void;
	handleUncollect: (input: CollectItemInput) => void;
};

const useCollectedItems = ({
	dal,
	viewMode,
}: UseCollectedItemsArgs): UseCollectedItemsResult => {
	const isPublicView = viewMode?.kind === "public";
	const publicUserId = viewMode?.kind === "public" ? viewMode.userId : null;

	const selfQuery = useDalQuery(dal.list, undefined);
	const publicQuery = useQuery({
		queryKey: [...dal.list.queryKey(undefined), "byUserId", publicUserId],
		queryFn: () =>
			publicUserId
				? dal.listByUserIdServerFn({ data: { userId: publicUserId } })
				: Promise.resolve([]),
		enabled: isPublicView && !!publicUserId,
	});

	const collectedData = isPublicView ? publicQuery.data : selfQuery.data;
	const collectedIds = (collectedData ?? []).map((r) => r.itemId);

	const { mutate: collect } = useDalMutation(dal.collect);
	const { mutate: uncollect } = useDalMutation(dal.uncollect);

	const handleCollect = ({ itemId, itemName }: CollectItemInput) =>
		collect({ itemId, itemName });

	const handleUncollect = ({ itemId, itemName }: CollectItemInput) =>
		uncollect({ itemId, itemName });

	return { collectedIds, isPublicView, handleCollect, handleUncollect };
};

export type { UseCollectedItemsArgs, UseCollectedItemsResult };
export { useCollectedItems };
