import { ActionIcon, Box, Collapse, Flex, Paper, Stack } from "@mantine/core";
import { LuX } from "react-icons/lu";
import { CollectionOptionsPanel } from "#/documents/item-list/item-filter-bar/CollectionOptionsPanel.tsx";
import { FilterPanelSection } from "#/documents/item-list/item-filter-bar/FilterPanelSection.tsx";
import type { ItemFilterControls } from "#/documents/item-list/use-item-filters.ts";
import classes from "./ItemFilterBar.module.css";

type ItemFilterPanelProps = {
	filters: ItemFilterControls;
	hasCollectableItems: boolean;
	expanded: boolean;
	onClose: () => void;
};

const ItemFilterPanel = ({
	filters,
	hasCollectableItems,
	expanded,
	onClose,
}: ItemFilterPanelProps) => (
	<Box className={classes.panelWrapper}>
		<Collapse expanded={expanded}>
			<Box className={classes.expandedOverlay}>
				<Paper withBorder className={classes.panelPaper}>
					<Stack gap="md" p="md">
						<Flex justify="flex-end">
							<ActionIcon
								variant="subtle"
								size="sm"
								onClick={onClose}
								aria-label="Close filters"
							>
								<LuX size={14} />
							</ActionIcon>
						</Flex>

						{hasCollectableItems && (
							<FilterPanelSection>
								<CollectionOptionsPanel filters={filters} />
							</FilterPanelSection>
						)}

						{filters.renderGameFilters && (
							<FilterPanelSection>
								{filters.renderGameFilters}
							</FilterPanelSection>
						)}
					</Stack>
				</Paper>
			</Box>
		</Collapse>
	</Box>
);

export { ItemFilterPanel };
