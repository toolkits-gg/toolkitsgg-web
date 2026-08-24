import { Box } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import type { ReactNode, Ref } from "react";
import { ActiveFilterChips } from "#/documents/item-list/item-filter-bar/ActiveFilterChips.tsx";
import { ItemFilterBarTopRow } from "#/documents/item-list/item-filter-bar/ItemFilterBarTopRow.tsx";
import { ItemFilterPanel } from "#/documents/item-list/item-filter-bar/ItemFilterPanel.tsx";
import type { ItemFilterControls } from "#/documents/item-list/use-item-filters.ts";
import type { ItemListLayout } from "#/documents/item-list/use-item-list-layout.ts";
import classes from "./ItemFilterBar.module.css";

type ItemFilterBarProps = {
	ref?: Ref<HTMLDivElement>;
	filters: ItemFilterControls;
	exportMenu?: ReactNode;
	hasCollectableItems: boolean;
	layout: ItemListLayout;
	onLayoutChange: (value: ItemListLayout) => void;
};

const ItemFilterBar = ({
	ref,
	filters,
	exportMenu,
	hasCollectableItems,
	layout,
	onLayoutChange,
}: ItemFilterBarProps) => {
	const [expanded, setExpanded] = useLocalStorage({
		key: "item-filters-expanded",
		defaultValue: false,
	});

	return (
		<Box ref={ref} className={classes.bar}>
			<ItemFilterBarTopRow
				search={filters.search}
				onSearchChange={(value) => filters.setUniversalParam("search", value)}
				layout={layout}
				onLayoutChange={onLayoutChange}
				expanded={expanded}
				onToggleExpanded={() => setExpanded((v) => !v)}
				exportMenu={exportMenu}
			/>
			<ActiveFilterChips
				activeFilters={filters.activeFilters}
				onClearAllFilters={filters.clearAllFilters}
			/>
			<ItemFilterPanel
				filters={filters}
				hasCollectableItems={hasCollectableItems}
				expanded={expanded}
				onClose={() => setExpanded(false)}
			/>
		</Box>
	);
};

export { ItemFilterBar };
