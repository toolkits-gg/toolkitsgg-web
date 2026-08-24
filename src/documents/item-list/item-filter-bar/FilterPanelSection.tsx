import { Paper } from "@mantine/core";
import type { ReactNode } from "react";

type FilterPanelSectionProps = {
	children: ReactNode;
};

const FilterPanelSection = ({ children }: FilterPanelSectionProps) => (
	<Paper
		withBorder
		p="md"
		bg="light-dark(var(--mantine-color-card-3),var(--mantine-color-card-7))"
	>
		{children}
	</Paper>
);

export { FilterPanelSection };
