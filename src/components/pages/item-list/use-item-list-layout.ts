import { useLocalStorage } from "@mantine/hooks";

type ItemListLayout = "cards" | "table";

const ITEM_LIST_LAYOUT_KEY = "item-list-layout";

/**
 * Owned by ItemListPage alone. Mantine's useLocalStorage instances do not sync
 * within a single window (the `storage` event is cross-window only), so the
 * value is passed down as props rather than by calling this hook again.
 */
const useItemListLayout = () =>
	useLocalStorage<ItemListLayout>({
		key: ITEM_LIST_LAYOUT_KEY,
		defaultValue: "cards",
	});

export type { ItemListLayout };
export { useItemListLayout };
