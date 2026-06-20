import type { MantineThemeOverride } from "@mantine/core";
import {
	Button,
	Card,
	Container,
	createTheme,
	Divider,
	Input,
	Modal,
	MultiSelect,
	Paper,
	rem,
	Select,
	Tooltip,
} from "@mantine/core";

import { GREEN, RED } from "#/features/theme/constants.ts";

import inputClasses from "../modules/Input.module.css";
import modalClasses from "../modules/Modal.module.css";
import multiSelectClasses from "../modules/MultiSelect.module.css";
import paperClasses from "../modules/Paper.module.css";
import selectClasses from "../modules/Select.module.css";
import tooltipClasses from "../modules/Tooltip.module.css";

const CONTAINER_SIZES: Record<string, string> = {
	xxs: rem("200px"),
	xs: rem("300px"),
	sm: rem("400px"),
	md: rem("500px"),
	lg: rem("600px"),
	xl: rem("1400px"),
	xxl: rem("1600px"),
};

//! Any changes to `BREAKPOINTS` should also be made to `postcss.config.mjs`
//! This will ensure responsive media queries work correctly
const BREAKPOINTS = {
	xs: "36em",
	sm: "48em",
	md: "62em",
	lg: "75em",
	xl: "88em",
};

const baseTheme: MantineThemeOverride = createTheme({
	fontFamily: "Geist, sans-serif",
	fontFamilyMonospace: "Geist Mono, monospace",
	headings: { fontFamily: "Geist, sans-serif" },
	fontSizes: {
		xs: rem("12px"),
		sm: rem("14px"),
		md: rem("16px"),
		lg: rem("18px"),
		xl: rem("20px"),
		"2xl": rem("24px"),
		"3xl": rem("30px"),
		"4xl": rem("36px"),
		"5xl": rem("48px"),
	},
	spacing: {
		"3xs": rem("4px"),
		"2xs": rem("8px"),
		xs: rem("10px"),
		sm: rem("12px"),
		md: rem("16px"),
		lg: rem("20px"),
		xl: rem("24px"),
		"2xl": rem("28px"),
		"3xl": rem("32px"),
	},
	breakpoints: BREAKPOINTS,
	primaryColor: "primary",
	primaryShade: { light: 5, dark: 5 },
	colors: {
		error: RED,
		success: GREEN,
	},
	components: {
		Button: Button.extend({
			defaultProps: {
				c: "baseFg.5",
			},
		}),

		Card: Card.extend({
			defaultProps: {
				p: "xl",
				shadow: "xl",
				radius: "var(--mantine-radius-default)",
				withBorder: true,
				bg: "card.5",
				c: "cardFg.5",
			},
		}),

		Container: Container.extend({
			vars: (_, { size, fluid }) => ({
				root: {
					"--container-size": fluid
						? "100%"
						: size !== undefined && size in CONTAINER_SIZES
							? CONTAINER_SIZES[size]
							: rem(size),
				},
			}),
		}),

		Divider: Divider.extend({
			defaultProps: {
				color: "border.7",
			},
		}),

		Input: Input.extend({
			classNames: {
				input: inputClasses.input,
			},
		}),

		Modal: Modal.extend({
			defaultProps: {
				withCloseButton: true,
				centered: true,
				size: "md",
				radius: "md",
			},
			classNames: {
				content: modalClasses.content,
				header: modalClasses.header,
				title: modalClasses.title,
			},
		}),

		Select: Select.extend({
			defaultProps: {
				checkIconPosition: "right",
			},
			classNames: {
				input: selectClasses.input,
				dropdown: selectClasses.dropdown,
				option: selectClasses.option,
			},
		}),

		MultiSelect: MultiSelect.extend({
			defaultProps: {
				clearable: true,
				hidePickedOptions: true,
				comboboxProps: {
					transitionProps: { transition: "pop", duration: 200 },
				},
			},
			classNames: {
				input: multiSelectClasses.input,
				dropdown: multiSelectClasses.dropdown,
				option: multiSelectClasses.option,
				pill: multiSelectClasses.pill,
				label: multiSelectClasses.label,
			},
		}),

		Paper: Paper.extend({
			defaultProps: {
				p: "md",
				shadow: "xl",
				radius: "md",
				withBorder: true,
			},
			classNames: {
				root: paperClasses.root,
			},
		}),

		Tooltip: Tooltip.extend({
			defaultProps: {
				withArrow: true,
				position: "top",
			},
			classNames: {
				tooltip: tooltipClasses.tooltip,
			},
		}),
	},
	other: {
		style: "mantine",
	},
});

export { baseTheme };
