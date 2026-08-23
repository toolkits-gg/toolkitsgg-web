import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import clsx from "clsx";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { columnStyle } from "#/components/pages/item-list/item-virtual-table/item-table-columns";
import type { AppItem } from "#/features/game/types";
import classes from "../ItemVirtualTable.module.css";

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

type ItemTableHeaderRowProps = {
	headerGroup: HeaderGroup<AppItem>;
};

const ItemTableHeaderRow = ({ headerGroup }: ItemTableHeaderRowProps) => (
	<tr className={classes.headerRow}>
		{headerGroup.headers.map((header) => {
			const sortable = header.column.getCanSort();
			const sorted = header.column.getIsSorted();

			return (
				<th
					key={header.id}
					className={clsx(classes.th, { [classes.sortable]: sortable })}
					style={columnStyle(header.column, header.getSize())}
					onClick={
						sortable ? header.column.getToggleSortingHandler() : undefined
					}
					aria-sort={sorted ? ARIA_SORT[sorted] : "none"}
				>
					<span className={classes.thLabel}>
						{flexRender(header.column.columnDef.header, header.getContext())}
					</span>
					{sorted === "asc" && <LuChevronUp size={12} />}
					{sorted === "desc" && <LuChevronDown size={12} />}
				</th>
			);
		})}
	</tr>
);

export type { ItemTableHeaderRowProps };
export { ItemTableHeaderRow };
