import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import { ClientOnly } from "@tanstack/react-router";
import { LuDownload } from "react-icons/lu";

type ItemExportScope = "filtered" | "all";

type ItemExportMenuProps = {
	filteredCount: number;
	allCount: number;
	onExport: (scope: ItemExportScope) => void;
};

const ItemExportMenu = ({
	filteredCount,
	allCount,
	onExport,
}: ItemExportMenuProps) => (
	<ClientOnly>
		<Menu shadow="md" width={240} withinPortal>
			<Menu.Target>
				<Tooltip label="Export CSV">
					<ActionIcon variant="subtle" size="lg" aria-label="Export CSV">
						<LuDownload size={18} />
					</ActionIcon>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>Export CSV</Menu.Label>
				<Menu.Item
					leftSection={<LuDownload size={14} />}
					disabled={filteredCount === 0}
					onClick={() => onExport("filtered")}
				>
					Filtered items ({filteredCount.toLocaleString()})
				</Menu.Item>
				<Menu.Item
					leftSection={<LuDownload size={14} />}
					disabled={allCount === 0}
					onClick={() => onExport("all")}
				>
					All items ({allCount.toLocaleString()})
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	</ClientOnly>
);

export type { ItemExportMenuProps, ItemExportScope };
export { ItemExportMenu };
