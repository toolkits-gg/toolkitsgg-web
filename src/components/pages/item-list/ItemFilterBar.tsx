import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Checkbox,
	CloseButton,
	Collapse,
	Flex,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import type { ReactNode } from "react";
import { LuChevronUp, LuFilter, LuX } from "react-icons/lu";
import { ItemSearchInput } from "#/components/pages/item-list/ItemSearchInput.tsx";
import classes from "./ItemFilterBar.module.css";

type ActiveFilter = {
	key: string;
	label: string;
	value: string;
	onRemove: () => void;
};

type ItemFilterBarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	showCollected: boolean;
	onShowCollectedChange: (value: boolean) => void;
	showUncollected: boolean;
	onShowUncollectedChange: (value: boolean) => void;
	dimUncollected: boolean;
	onDimUncollectedChange: (value: boolean) => void;
	showCollectableOnly: boolean;
	onShowCollectableOnlyChange: (value: boolean) => void;
	activeFilters: ActiveFilter[];
	onClearAllFilters: () => void;
	renderGameFilters?: ReactNode;
	hasCollectableItems: boolean;
};

const ItemFilterBar = ({
	search,
	onSearchChange,
	showCollected,
	onShowCollectedChange,
	showUncollected,
	onShowUncollectedChange,
	dimUncollected,
	onDimUncollectedChange,
	showCollectableOnly,
	onShowCollectableOnlyChange,
	activeFilters,
	onClearAllFilters,
	renderGameFilters,
	hasCollectableItems,
}: ItemFilterBarProps) => {
	const [expanded, setExpanded] = useLocalStorage({
		key: "item-filters-expanded",
		defaultValue: false,
	});

	return (
		<Box className={classes.bar}>
			<div className={classes.topRow}>
				<ItemSearchInput
					searchValue={search}
					onSearchChange={(e) => onSearchChange(e)}
				/>
				<ActionIcon
					variant="subtle"
					size="lg"
					onClick={() => setExpanded((v) => !v)}
					aria-label={expanded ? "Collapse filters" : "Expand filters"}
				>
					{expanded ? <LuChevronUp size={18} /> : <LuFilter size={18} />}
				</ActionIcon>
			</div>

			{activeFilters.length > 0 && (
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
						<Button
							variant="subtle"
							size="compact-xs"
							onClick={onClearAllFilters}
						>
							Clear all
						</Button>
					</Group>
				</div>
			)}

			<Box style={{ position: "relative" }}>
				<Collapse expanded={expanded}>
					<Box className={classes.expandedOverlay}>
						<Paper
							withBorder
							style={{
								borderTop: "none",
								borderTopLeftRadius: 0,
								borderTopRightRadius: 0,
							}}
						>
							<Stack gap="md" p="md">
								<Flex justify="flex-end">
									<ActionIcon
										variant="subtle"
										size="sm"
										onClick={() => setExpanded(false)}
										aria-label="Close filters"
									>
										<LuX size={14} />
									</ActionIcon>
								</Flex>

								{hasCollectableItems && (
									<Paper
										withBorder
										p="md"
										bg="light-dark(var(--mantine-color-card-3),var(--mantine-color-card-7))"
									>
										<Stack gap="xs">
											<Text fz="sm" fw={500} c="dimmed" mb={2}>
												Collection Options
											</Text>
											<SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing="md">
												<Checkbox
													checked={showCollected}
													onChange={(e) =>
														onShowCollectedChange(e.currentTarget.checked)
													}
													label="Show collected"
													size="sm"
												/>
												<Checkbox
													checked={showUncollected}
													onChange={(e) =>
														onShowUncollectedChange(e.currentTarget.checked)
													}
													label="Show uncollected"
													size="sm"
												/>
												<Checkbox
													checked={dimUncollected}
													onChange={(e) =>
														onDimUncollectedChange(e.currentTarget.checked)
													}
													label="Dim uncollected"
													size="sm"
												/>
												<Checkbox
													checked={showCollectableOnly}
													onChange={(e) =>
														onShowCollectableOnlyChange(e.currentTarget.checked)
													}
													label="Collectable only"
													size="sm"
												/>
											</SimpleGrid>
										</Stack>
									</Paper>
								)}

								{renderGameFilters && (
									<Paper
										withBorder
										p="md"
										bg="light-dark(var(--mantine-color-card-3),var(--mantine-color-card-7))"
									>
										{renderGameFilters}
									</Paper>
								)}
							</Stack>
						</Paper>
					</Box>
				</Collapse>
			</Box>
		</Box>
	);
};

export { ItemFilterBar };
export type { ActiveFilter };
