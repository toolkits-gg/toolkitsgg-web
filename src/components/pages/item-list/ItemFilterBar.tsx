import { Box } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import type { ReactNode, Ref } from "react";
import { ActiveFilterChips } from "#/components/pages/item-list/item-filter-bar/ActiveFilterChips";
import { ItemFilterBarTopRow } from "#/components/pages/item-list/item-filter-bar/ItemFilterBarTopRow";
import { ItemFilterPanel } from "#/components/pages/item-list/item-filter-bar/ItemFilterPanel";
import type { ItemFilterControls } from "#/components/pages/item-list/use-item-filters";
import type { ItemListLayout } from "#/components/pages/item-list/use-item-list-layout";
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
