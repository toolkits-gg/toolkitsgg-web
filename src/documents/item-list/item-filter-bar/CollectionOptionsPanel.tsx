import { Checkbox, SimpleGrid, Stack, Text } from "@mantine/core";
import type {
	ItemFilterControls,
	UniversalParamKey,
} from "#/documents/item-list/use-item-filters.ts";

const COLLECTION_OPTIONS = [
	{ key: "showCollectedItems", label: "Show collected" },
	{ key: "showUncollectedItems", label: "Show uncollected" },
	{ key: "dimUncollectedItems", label: "Dim uncollected" },
	{ key: "showCollectableOnly", label: "Collectable only" },
] as const satisfies readonly { key: UniversalParamKey; label: string }[];

type CollectionOptionsPanelProps = {
	filters: ItemFilterControls;
};

const CollectionOptionsPanel = ({ filters }: CollectionOptionsPanelProps) => (
	<Stack gap="xs">
		<Text fz="sm" fw={500} c="dimmed" mb={2}>
			Collection Options
		</Text>
		<SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing="md">
			{COLLECTION_OPTIONS.map(({ key, label }) => (
				<Checkbox
					key={key}
					checked={filters[key]}
					onChange={(e) =>
						filters.setUniversalParam(key, e.currentTarget.checked)
					}
					label={label}
					size="sm"
				/>
			))}
		</SimpleGrid>
	</Stack>
);

export { CollectionOptionsPanel };
