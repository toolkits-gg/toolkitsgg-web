import { Tabs } from "@mantine/core";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useGameId } from "#/features/game/use-game-id";
import { gameSupportsBuilds } from "#/games-registry/builds-registry";

type ProfileTabNavProps = {
	basePath: string;
	showDataSync?: boolean;
};

type ProfileTab = { label: string; path: string; requiresBuilds?: boolean };

const TABS: readonly ProfileTab[] = [
	{ label: "Home", path: "" },
	{ label: "Collected Items", path: "collected-items" },
	{ label: "Liked Builds", path: "liked-builds", requiresBuilds: true },
	{
		label: "Build Collections",
		path: "build-collections",
		requiresBuilds: true,
	},
	{ label: "Created Builds", path: "created-builds", requiresBuilds: true },
];

const DATA_SYNC_TAB: ProfileTab = { label: "Data Sync", path: "data-sync" };

export function ProfileTabNav({
	basePath,
	showDataSync = false,
}: ProfileTabNavProps) {
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });
	const gameId = useGameId();
	const supportsBuilds = gameSupportsBuilds(gameId);

	const getTabValue = (path: string) =>
		path === "" ? basePath : `${basePath}/${path}`;

	const visibleTabs = TABS.filter(
		(tab) => !tab.requiresBuilds || supportsBuilds,
	);
	const allTabs = showDataSync ? [...visibleTabs, DATA_SYNC_TAB] : visibleTabs;

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
