import type { MantineColorScheme, MantineColorsTuple } from "@mantine/core";

const WHITE: MantineColorsTuple = [
	"#ffffff",
	"#fdfcfe",
	"#fbf8fd",
	"#fbf8fd",
	"#f9f5fc",
	"#f7f2fb",
	"#d2b2e8",
	"#b171d5",
	"#7c3e9a",
	"#421e54",
	"#291135",
];

const BLACK: MantineColorsTuple = [
	"#ecdcff",
	"#dbb8ff",
	"#be68ff",
	"#9800dd",
	"#53007b",
	"#0a0014",
	"#0a0013",
	"#0a0013",
	"#000000",
	"#000000",
	"#000000",
];

const RED: MantineColorsTuple = [
	"#ffecec",
	"#ffdada",
	"#ffb3b3",
	"#ff8484",
	"#ff4d4d",
	"#eb0000",
	"#bc0000",
	"#930000",
	"#690000",
	"#410000",
	"#2d0000",
];

const GREEN: MantineColorsTuple = [
	"#ebfbee",
	"#d3f9d8",
	"#b2f2bb",
	"#8ce99a",
	"#69db7c",
	"#51cf66",
	"#40c057",
	"#37b24d",
	"#2f9e44",
	"#2b8a3e",
];

const DEFAULT_NEXT_THEME = "default-dark";
const MANTINE_COLOR_SCHEMES: MantineColorScheme[] = ["auto", "dark", "light"];
const LOCALSTORAGE_KEYS = {
	AUTO_CHANGE_THEME: "auto-change-theme",
};

export {
	BLACK,
	GREEN,
	RED,
	WHITE,
	DEFAULT_NEXT_THEME,
	MANTINE_COLOR_SCHEMES,
	LOCALSTORAGE_KEYS,
};
