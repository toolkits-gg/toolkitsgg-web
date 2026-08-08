import { Text } from "@mantine/core";
import classes from "./ItemListEmptyState.module.css";

const ItemListEmptyState = () => (
	<div className={classes.emptyState}>
		<Text size="xl" fw={600} c="dimmed">
			No items found
		</Text>
		<Text size="sm" c="dimmed" ta="center">
			Try adjusting your filters or search query
		</Text>
	</div>
);

export { ItemListEmptyState };
