import type { MantineColorsTuple } from "@mantine/core";
import { clampChroma, converter, formatHex, parse } from "culori";
import { RED, WHITE } from "#/features/theme/constants.ts";
import type { ToolkitThemeColorKey } from "#/features/theme/types.ts";
import type { ThemeColorInput } from "#/features/theme/utils.ts";

// ---------------------------------------------------------------------------
// OKLCH helpers
// ---------------------------------------------------------------------------

const toOklch = converter("oklch");

type Oklch = { l: number; c: number; h: number };

const hexToOklch = (hex: string): Oklch => {
	const parsed = toOklch(parse(hex));
	if (!parsed) {
		throw new Error(`Invalid color hex: ${hex}`);
	}
	return { l: parsed.l ?? 0, c: parsed.c ?? 0, h: parsed.h ?? 0 };
};

const oklchToHex = ({ l, c, h }: Oklch): string =>
	formatHex(clampChroma({ mode: "oklch", l, c, h }, "oklch")) ?? "#000000";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const asTuple = (entries: string[]): MantineColorsTuple =>
	entries as unknown as MantineColorsTuple;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

type ThemePaletteConfig = {
	primary: string;
	secondary: string;
	accent?: string;
	ring?: "primary" | "secondary" | "accent" | (string & {});
	sidebar?: { dark?: string; light?: string };
};

// ---------------------------------------------------------------------------
// Ramp parameters
//
// All ramps walk lightness in OKLCH from a light anchor at [0] down to a dark
// anchor at [9], anchored at the input or target lightness at [5]. The t-values
// below are the interpolation parameters for each shade index.
// ---------------------------------------------------------------------------

const LIGHT_ANCHOR = 0.98;
const DARK_ANCHOR = 0.02;

const T_TO_LIGHT_FOR_05 = [0.95, 0.83, 0.62, 0.4, 0.18];
const T_TO_DARK_FOR_69 = [0.18, 0.36, 0.62, 0.85];

// Chroma multiplier per shade — peaks at [5], falls off toward extremes so very
// light/dark shades don't look muddy.
const CHROMA_CURVE = [0.12, 0.22, 0.45, 0.65, 0.9, 1.0, 0.95, 0.85, 0.65, 0.4];

// Light-mode neutrals pin [0]-[2] to white and step down sharply at [6]-[9],
// matching how the existing themes use these slots (page bg = white, card bg =
// white, [6]-[9] used as colored borders/dividers).
const NEUTRAL_LIGHT_T_FROM_WHITE_FOR_34 = [0.5, 0.8];
const NEUTRAL_LIGHT_DOWNSTEPS_FOR_69: Array<{ floor: number; t: number }> = [
	{ floor: 0.5, t: 0.25 },
	{ floor: 0.4, t: 0.5 },
	{ floor: 0.3, t: 0.75 },
	{ floor: 0.18, t: 0.95 },
];

const NEUTRAL_CHROMA = 0.006;
const FG_TINT_CHROMA = 0.01;
const FG_LIGHT_LIGHTNESSES = [
	0.55, 0.45, 0.35, 0.25, 0.15, 0.04, 0.03, 0.02, 0.015, 0.01,
];
const FG_BG_LIGHTNESS_THRESHOLD = 0.65;

// ---------------------------------------------------------------------------
// Neutral target lightnesses
//
// Background colors at [5] cluster at predictable points across all three
// hand-tuned themes — base/popover are deepest, border/input are highest so
// they can be visible against cards. Numbers below were dialed in to match the
// originals' apparent darkness.
// ---------------------------------------------------------------------------

type NeutralKey =
	| "base"
	| "card"
	| "popover"
	| "muted"
	| "border"
	| "input"
	| "sidebar";

const DEFAULT_SIDEBAR_LIGHT = "#f5f7fa";

const NEUTRAL_TARGET_L: Record<NeutralKey, { dark: number; light: number }> = {
	base: { dark: 0.16, light: 0.99 },
	card: { dark: 0.18, light: 0.99 },
	popover: { dark: 0.17, light: 0.99 },
	muted: { dark: 0.22, light: 0.95 },
	border: { dark: 0.32, light: 0.95 },
	input: { dark: 0.26, light: 0.93 },
	sidebar: { dark: 0.2, light: 0.97 },
};

// ---------------------------------------------------------------------------
// Ramp builders
// ---------------------------------------------------------------------------

/**
 * 10-shade ramp around an input hex. The input is preserved exactly at [5];
 * other shades blend toward LIGHT_ANCHOR (towards [0]) and DARK_ANCHOR
 * (towards [9]) in OKLCH, with chroma falloff at the extremes.
 */
const rampFromHex = (hex: string): MantineColorsTuple => {
	const { l, c, h } = hexToOklch(hex);
	const lightnesses = [
		...T_TO_LIGHT_FOR_05.map((t) => lerp(l, LIGHT_ANCHOR, t)),
		l,
		...T_TO_DARK_FOR_69.map((t) => lerp(l, DARK_ANCHOR, t)),
	];
	const ramp = lightnesses.map((targetL, i) =>
		oklchToHex({ l: targetL, c: c * CHROMA_CURVE[i], h }),
	);
	ramp[5] = hex;
	return asTuple(ramp);
};

const neutralDark = (targetL5: number, hue: number): MantineColorsTuple => {
	const lightnesses = [
		...T_TO_LIGHT_FOR_05.map((t) => lerp(targetL5, LIGHT_ANCHOR, t)),
		targetL5,
		...T_TO_DARK_FOR_69.map((t) => lerp(targetL5, DARK_ANCHOR, t)),
	];
	return asTuple(
		lightnesses.map((l) => oklchToHex({ l, c: NEUTRAL_CHROMA, h: hue })),
	);
};

const neutralLight = (targetL5: number, hue: number): MantineColorsTuple => {
	const lightnesses = [
		LIGHT_ANCHOR,
		LIGHT_ANCHOR,
		LIGHT_ANCHOR,
		...NEUTRAL_LIGHT_T_FROM_WHITE_FOR_34.map((t) =>
			lerp(LIGHT_ANCHOR, targetL5, t),
		),
		targetL5,
		...NEUTRAL_LIGHT_DOWNSTEPS_FOR_69.map(({ floor, t }) =>
			lerp(targetL5, floor, t),
		),
	];
	return asTuple(
		lightnesses.map((l) => oklchToHex({ l, c: NEUTRAL_CHROMA, h: hue })),
	);
};

const buildNeutral = (
	key: NeutralKey,
	hue: number,
): { dark: MantineColorsTuple; light: MantineColorsTuple } => {
	const target = NEUTRAL_TARGET_L[key];
	return {
		dark: neutralDark(target.dark, hue),
		light: neutralLight(target.light, hue),
	};
};

// ---------------------------------------------------------------------------
// Foreground ramps
// ---------------------------------------------------------------------------

/**
 * Tinted dark-text ramp for fgLight slots. Replaces the BLACK constant so
 * non-[5] indices stay subtly primary-tinted instead of dropping into purple.
 */
const tintedFgLight = (hue: number): MantineColorsTuple =>
	asTuple(
		FG_LIGHT_LIGHTNESSES.map((l) =>
			oklchToHex({ l, c: FG_TINT_CHROMA, h: hue }),
		),
	);

/**
 * Picks WHITE (dark mode) or a primary-tinted dark ramp (light mode) based on
 * background lightness in OKLCH.
 */
const pickForeground = (
	bgHex: string,
	primaryHue: number,
): MantineColorsTuple =>
	hexToOklch(bgHex).l > FG_BG_LIGHTNESS_THRESHOLD
		? tintedFgLight(primaryHue)
		: WHITE;

// Tinted-gray fg ramp used by `card` and `muted`. Hoisted from the original
// hand-tuned Clair Obscur / Slay the Spire 2 themes (they used this identical
// ramp; Remnant 2 had a slightly warmer one — the difference is barely visible).
const CUSTOM_FG_DARK: MantineColorsTuple = [
	"#f0f1f4",
	"#e0e2e7",
	"#c1c4cd",
	"#a3a7b3",
	"#848a99",
	"#666d7f",
	"#505565",
	"#3d414d",
	"#292c35",
	"#17191f",
];

const CUSTOM_FG_LIGHT: MantineColorsTuple = [
	"#e4e5e8",
	"#c7c9cf",
	"#9296a2",
	"#626571",
	"#373940",
	"#101114",
	"#0d0e11",
	"#0a0b0d",
	"#070709",
	"#030405",
];

// ---------------------------------------------------------------------------
// Ring source resolution
// ---------------------------------------------------------------------------

const resolveRing = (
	source: ThemePaletteConfig["ring"],
	primary: MantineColorsTuple,
	secondary: MantineColorsTuple,
	accent: MantineColorsTuple,
): MantineColorsTuple => {
	if (!source || source === "primary") return primary;
	if (source === "secondary") return secondary;
	if (source === "accent") return accent;
	return rampFromHex(source);
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Convenience function to use the same color ramp for dark and light modes.
 */
const symmetric = (
	ramp: MantineColorsTuple,
	fgDark: MantineColorsTuple,
	fgLight: MantineColorsTuple,
): ThemeColorInput => ({ dark: ramp, light: ramp, fgDark, fgLight });

/**
 * Generates the full set of theme color inputs from a small config. Output is
 * shaped exactly like the argument to `createThemeColors()`.
 */
const generateThemeColors = (
	config: ThemePaletteConfig,
): Record<ToolkitThemeColorKey, ThemeColorInput> => {
	const primaryHue = hexToOklch(config.primary).h;
	const fgLight = tintedFgLight(primaryHue);
	const fg = (bgHex: string) => pickForeground(bgHex, primaryHue);

	const primary = rampFromHex(config.primary);
	const secondary = rampFromHex(config.secondary);
	const accentHex = config.accent ?? config.primary;
	const accent = rampFromHex(accentHex);
	const ring = resolveRing(config.ring, primary, secondary, accent);

	const base = buildNeutral("base", primaryHue);
	const card = buildNeutral("card", primaryHue);
	const popover = buildNeutral("popover", primaryHue);
	const muted = buildNeutral("muted", primaryHue);
	const border = buildNeutral("border", primaryHue);
	const input = buildNeutral("input", primaryHue);

	const sidebarDefaults = buildNeutral("sidebar", primaryHue);
	const sidebarDark = config.sidebar?.dark
		? rampFromHex(config.sidebar.dark)
		: sidebarDefaults.dark;
	const sidebarLight = rampFromHex(
		config.sidebar?.light ?? DEFAULT_SIDEBAR_LIGHT,
	);

	return {
		primary: symmetric(primary, fg(config.primary), fg(config.primary)),
		secondary: symmetric(secondary, fg(config.secondary), fg(config.secondary)),
		accent: symmetric(accent, fg(accentHex), fg(accentHex)),
		ring: symmetric(ring, fg(ring[5]), fg(ring[5])),
		destructive: symmetric(RED, WHITE, WHITE),
		base: { dark: base.dark, light: base.light, fgDark: WHITE, fgLight },
		popover: {
			dark: popover.dark,
			light: popover.light,
			fgDark: WHITE,
			fgLight,
		},
		border: {
			dark: border.dark,
			light: border.light,
			fgDark: WHITE,
			fgLight,
		},
		input: { dark: input.dark, light: input.light, fgDark: WHITE, fgLight },
		card: {
			dark: card.dark,
			light: card.light,
			fgDark: CUSTOM_FG_DARK,
			fgLight: CUSTOM_FG_LIGHT,
		},
		muted: {
			dark: muted.dark,
			light: muted.light,
			fgDark: CUSTOM_FG_DARK,
			fgLight: CUSTOM_FG_LIGHT,
		},
		sidebar: {
			dark: sidebarDark,
			light: sidebarLight,
			fgDark: fg(sidebarDark[5]),
			fgLight: fg(sidebarLight[5]),
		},
	};
};

export type { ThemePaletteConfig };
export { generateThemeColors, hexToOklch, pickForeground, rampFromHex };
