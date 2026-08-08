import { flexRender, type Row } from "@tanstack/react-table";
import clsx from "clsx";
import type { AppItem } from "#/features/game/types.ts";
import classes from "../AppItemVirtualTable.module.css";
import { columnStyle } from "./item-table-columns.tsx";

const ROW_HEIGHT = 40;

/** Cells whose own controls would otherwise re-trigger the row's click handler. */
const SELF_HANDLED_CELLS = new Set(["collected", "actions"]);

const stopPropagation = (event: { stopPropagation: () => void }) =>
	event.stopPropagation();

type ItemTableRowProps = {
	row: Row<AppItem>;
	offset: number;
	collected: boolean;
	dimmed: boolean;
	interactive: boolean;
	onActivate: () => void;
};

const ItemTableRow = ({
	row,
	offset,
	collected,
	dimmed,
	interactive,
	onActivate,
}: ItemTableRowProps) => (
	<tr
		className={clsx(classes.row, {
			[classes.collected]: collected,
			[classes.dimmed]: dimmed,
			[classes.interactive]: interactive,
		})}
		style={{ height: ROW_HEIGHT, transform: `translateY(${offset}px)` }}
		tabIndex={interactive ? 0 : undefined}
		onClick={onActivate}
		onKeyDown={(event) => {
			if (!interactive) return;
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				onActivate();
			}
		}}
	>
		{row.getVisibleCells().map((cell) => (
			// biome-ignore lint/a11y/useKeyWithClickEvents: the row already handles keyboard activation; this only stops the cell's buttons from double-firing
			<td
				key={cell.id}
				className={classes.td}
				style={columnStyle(cell.column, cell.column.getSize())}
				onClick={
					SELF_HANDLED_CELLS.has(cell.column.id) ? stopPropagation : undefined
				}
			>
				{flexRender(cell.column.columnDef.cell, cell.getContext())}
			</td>
		))}
	</tr>
);

export type { ItemTableRowProps };
export { ItemTableRow, ROW_HEIGHT };
