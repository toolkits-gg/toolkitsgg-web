import { Badge, Button, CloseButton, Group } from "@mantine/core";
import type { ActiveFilter } from "#/documents/item-list/use-item-filters.ts";
import classes from "./ItemFilterBar.module.css";

type ActiveFilterChipsProps = {
	activeFilters: ActiveFilter[];
	onClearAllFilters: () => void;
};

const ActiveFilterChips = ({
	activeFilters,
	onClearAllFilters,
}: ActiveFilterChipsProps) => {
	if (activeFilters.length === 0) return null;

	return (
		<div className={classes.activeFiltersRow}>
			<Group gap="2xs" wrap="wrap" align="center">
				{activeFilters.map((f) => (
					<Badge
						key={f.key}
						variant="light"
						size="sm"
						rightSection={
							<CloseButton
								size="xs"
								iconSize={10}
								onClick={f.onRemove}
								aria-label={`Remove ${f.label} filter`}
							/>
						}
						pr={2}
					>
						{f.label}: {f.value}
					</Badge>
				))}
				<Button variant="subtle" size="compact-xs" onClick={onClearAllFilters}>
					Clear all
				</Button>
			</Group>
		</div>
	);
};

export { ActiveFilterChips };
