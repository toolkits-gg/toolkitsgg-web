import { ActionIcon, SegmentedControl } from "@mantine/core";
import type { ReactNode } from "react";
import {
	LuChevronUp,
	LuFilter,
	LuLayoutGrid,
	LuTableProperties,
} from "react-icons/lu";
import { ItemSearchInput } from "#/components/pages/item-list/item-filter-bar/ItemSearchInput";
import type { ItemListLayout } from "#/components/pages/item-list/use-item-list-layout";
import classes from "../ItemFilterBar.module.css";

const LAYOUT_OPTIONS = [
	{
		value: "cards",
		label: <LuLayoutGrid size={16} aria-label="Card layout" />,
	},
	{
		value: "table",
		label: <LuTableProperties size={16} aria-label="Table layout" />,
	},
];

type ItemFilterBarTopRowProps = {
	search: string;
	onSearchChange: (value: string) => void;
	layout: ItemListLayout;
	onLayoutChange: (value: ItemListLayout) => void;
	expanded: boolean;
	onToggleExpanded: () => void;
	exportMenu?: ReactNode;
};

const ItemFilterBarTopRow = ({
	search,
	onSearchChange,
	layout,
	onLayoutChange,
	expanded,
	onToggleExpanded,
	exportMenu,
}: ItemFilterBarTopRowProps) => (
	<div className={classes.topRow}>
		<ItemSearchInput searchValue={search} onSearchChange={onSearchChange} />
		<SegmentedControl
			className={classes.layoutToggle}
			size="xs"
			value={layout}
			onChange={(value) => onLayoutChange(value as ItemListLayout)}
			data={LAYOUT_OPTIONS}
		/>
		<ActionIcon
			variant="subtle"
			size="lg"
			onClick={onToggleExpanded}
			aria-label={expanded ? "Collapse filters" : "Expand filters"}
		>
			{expanded ? <LuChevronUp size={18} /> : <LuFilter size={18} />}
		</ActionIcon>
		{exportMenu}
	</div>
);

export { ItemFilterBarTopRow };
