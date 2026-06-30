import {
	Flex,
	type MantineColorScheme,
	Select,
	Switch,
	useMantineColorScheme,
} from "@mantine/core";
import { upperFirst, useLocalStorage } from "@mantine/hooks";
import { useTheme as useNextTheme } from "next-themes";
import { type ChangeEvent, useState } from "react";
import {
	LOCALSTORAGE_KEYS,
	MANTINE_COLOR_SCHEMES,
} from "#/features/theme/constants.ts";
import {
	getAllRegisteredThemeClassNames,
	getAllRegisteredThemeDefinitions,
	parseColorScheme,
} from "#/features/theme/utils.ts";
import { getGameTheme } from "#/registry/game-public-registry.tsx";

// This feature was game-aware, need to rework it
const allThemeDefinitions: Array<{ label: string; className: string }> =
	getAllRegisteredThemeDefinitions();

// This feature was game-aware, need to rework it
const allThemeClassNames: string[] = getAllRegisteredThemeClassNames();

type ThemeModalProps = {
	gameId: string | undefined;
};

const ThemeModal = ({ gameId }: ThemeModalProps) => {
	const [autoChangeTheme, setAutoChangeTheme] = useLocalStorage({
		key: LOCALSTORAGE_KEYS.AUTO_CHANGE_THEME,
		defaultValue: true,
	});

	const { setColorScheme } = useMantineColorScheme();

	const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
	const [mode, setMode] = useState<MantineColorScheme>("auto");

	const handleChangeNextTheme = (value: string | null) => {
		const newNextTheme = value ?? "default-dark";

		const newColorScheme = parseColorScheme(newNextTheme);
		if (mode !== newColorScheme) {
			setColorScheme(newColorScheme);
		}
		setNextTheme(newNextTheme);
	};

	const handleChangeMode = (value: string | null) => {
		if (!value) return;
		if (!nextTheme) return;

		const assertedValue = value as MantineColorScheme;

		setMode(assertedValue);
		setColorScheme(assertedValue);

		if (assertedValue === "light") {
			setNextTheme(nextTheme?.replace("-dark", "-light"));
		}
		if (assertedValue === "dark") {
			setNextTheme(nextTheme?.replace("-light", "-dark"));
		}
	};

	const currentThemeValue =
		nextTheme && allThemeClassNames.includes(nextTheme)
			? nextTheme
			: "default-dark";

	return (
		<Flex align="center" justify="space-between" gap="md" direction="column">
			<Flex>
				<Switch
					checked={autoChangeTheme}
					label="Auto change theme on game change"
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						const checked = event.currentTarget.checked;
						setAutoChangeTheme(checked);

						if (!nextTheme) return;

						if (checked) {
							const className =
								(gameId ? getGameTheme(gameId)?.className : undefined) ??
								"default";

							if (className !== nextTheme) {
								const newNextTheme = nextTheme.replace(/^[^-]+/, className);
								setNextTheme(newNextTheme);
							}
						}
					}}
				/>
			</Flex>
			<Flex gap="md" align="center" justify="space-between">
				<Select
					label="Select mode"
					data={MANTINE_COLOR_SCHEMES.map((tm) => ({
						label: tm === "auto" ? "All" : upperFirst(tm),
						value: tm,
					}))}
					value={mode}
					onChange={handleChangeMode}
				/>
			</Flex>
			<Flex w="100%" align="center" justify="center">
				<Select
					label="Select theme"
					value={currentThemeValue}
					data={allThemeDefinitions
						.filter((def) => {
							if (mode === "auto") {
								return true;
							}
							if (mode === "dark" && def.label.includes("Dark")) {
								return true;
							}
							return mode === "light" && def.label.includes("Light");
						})
						.map((def) => ({
							label: def.label,
							value: def.className,
						}))}
					onChange={handleChangeNextTheme}
				/>
			</Flex>
		</Flex>
	);
};

export { ThemeModal };
