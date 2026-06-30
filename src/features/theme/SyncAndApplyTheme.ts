import type { MantineThemeOverride } from "@mantine/core";
import { useTheme as useNextTheme } from "next-themes";
import { useEffect } from "react";
import { useGameId } from "#/features/game/use-game-id.ts";
import { LOCALSTORAGE_KEYS } from "#/features/theme/constants.ts";
import { changeMantineTheme } from "#/features/theme/store.ts";
import { defaultTheme } from "#/features/theme/themes/default-theme.ts";
import { getAllRegisteredThemeDefinitions } from "#/features/theme/utils.ts";
import { getGameTheme } from "#/registry/game-public-registry.tsx";

/**
 * This function determines which Mantine theme to use based on the provided nextTheme class string.
 * It checks if the nextTheme includes any game-specific class names defined in the game configurations.
 * If no matching game theme is found, it falls back to the default theme.
 */
const nextThemeToMantineTheme = (
	nextTheme: string | undefined,
): MantineThemeOverride => {
	const themeDefinition = getAllRegisteredThemeDefinitions().find(
		(definition) => nextTheme?.includes(definition.className),
	);

	if (!themeDefinition?.theme) {
		return defaultTheme;
	}

	return themeDefinition.theme;
};

const SyncAndApplyTheme = () => {
	const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
	const gameId = useGameId();

	/**
	 * Watches for changes to gameId, and if autoChangeTheme is enabled and
	 * nextTheme is set, it will change the theme to match the game's theme.
	 */

	// biome-ignore lint/correctness/useExhaustiveDependencies: <We intentionally want to only run this effect when gameId changes, not when nextTheme or autoChangeTheme changes>
	useEffect(() => {
		/**
		 * ! We read autoChangeTheme directly from localStorage instead of using
		 * ! useLocalStorage to avoid stale-state issues: the useLocalStorage instance
		 * ! here and the one in ThemeModal are separate, and the browser
		 * ! `storage` event only fires across windows — not within the same window —
		 * ! so the two instances never stay in sync reactively.
		 */
		const stored = localStorage.getItem(LOCALSTORAGE_KEYS.AUTO_CHANGE_THEME);
		const autoChangeTheme =
			stored === null ? true : JSON.parse(stored) === true;

		if (!autoChangeTheme) {
			return;
		}

		if (!nextTheme) {
			return;
		}

		const gameTheme = getGameTheme(gameId);
		let className = gameTheme?.className;
		if (!className) {
			className = "default";
		}

		if (className && className !== nextTheme) {
			// replace everything before the first '-' with the gameTheme
			const newNextTheme = nextTheme.replace(/^[^-]+/, className);
			setNextTheme(newNextTheme);
		}
	}, [gameId]);

	/**
	 * Syncs the Mantine theme with the nextTheme. Whenever nextTheme changes,
	 * it will update the Mantine theme to match the new nextTheme
	 */
	useEffect(() => {
		changeMantineTheme(nextThemeToMantineTheme(nextTheme));
	}, [nextTheme]);

	return null;
};

export { SyncAndApplyTheme };
