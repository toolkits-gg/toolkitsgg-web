import { Tabs } from "@mantine/core";
import { useNavigate, useRouterState } from "@tanstack/react-router";

type ProfileTabNavProps = {
	basePath: string;
	showDataSync?: boolean;
};

const TABS = [
	{ label: "Home", path: "" },
	{ label: "Collected Items", path: "collected-items" },
	{ label: "Liked Builds", path: "liked-builds" },
	{ label: "Build Collections", path: "build-collections" },
	{ label: "Created Builds", path: "created-builds" },
	{ label: "Featured Builds", path: "featured-builds" },
] as const;

const DATA_SYNC_TAB = { label: "Data Sync", path: "data-sync" } as const;

export function ProfileTabNav({
	basePath,
	showDataSync = false,
}: ProfileTabNavProps) {
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });

	const getTabValue = (path: string) =>
		path === "" ? basePath : `${basePath}/${path}`;

	const allTabs = showDataSync
		? ([...TABS, DATA_SYNC_TAB] as readonly { label: string; path: string }[])
		: (TABS as readonly { label: string; path: string }[]);

	const activeTab = (() => {
		const pathname = location.pathname.replace(/\/$/, "");
		if (pathname === basePath) return basePath;
		for (const tab of allTabs) {
			if (tab.path && pathname.endsWith(`/${tab.path}`)) {
				return `${basePath}/${tab.path}`;
			}
		}
		return basePath;
	})();

	const handleTabChange = (value: string | null) => {
		if (!value) return;
		navigate({ to: value }).then(() => {
			// placeholder - no action needed
		});
	};

	return (
		<Tabs value={activeTab} onChange={handleTabChange}>
			<Tabs.List>
				{allTabs.map((tab) => {
					const value = getTabValue(tab.path);
					return (
						<Tabs.Tab key={value} value={value}>
							{tab.label}
						</Tabs.Tab>
					);
				})}
			</Tabs.List>
		</Tabs>
	);
}
