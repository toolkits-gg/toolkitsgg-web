const GAME_ID = "remnant2";

const ARCHETYPE_COLORS = {
	ALCHEMIST: {
		bg: {
			light: "#BBCAC5",
			dark: "#102a22",
		},
		text: {
			light: "#074f3c",
			dark: "#10a880",
		},
	},
	ARCHON: {
		bg: {
			light: "#BBC8CD",
			dark: "#102730",
		},
		text: {
			light: "#264c59",
			dark: "#56a9c6",
		},
	},
	CHALLENGER: {
		bg: {
			light: "#CCC9C5",
			dark: "#373029",
		},
		text: {
			light: "#534a46",
			dark: "#af9c94",
		},
	},
	ENGINEER: {
		bg: {
			light: "#C2C7D8",
			dark: "#26315a",
		},
		text: {
			light: "#3f455a",
			dark: "#b2bee9",
		},
	},
	EXPLORER: {
		bg: {
			light: "#C9CFC1",
			dark: "#2f3c1f",
		},
		text: {
			light: "#2c5435",
			dark: "#67c47c",
		},
	},
	GUNSLINGER: {
		bg: {
			light: "#D1BEBE",
			dark: "#3f1818",
		},
		text: {
			light: "#693230",
			dark: "#de6966",
		},
	},
	HANDLER: {
		bg: {
			light: "#D7D7C0",
			dark: "#545520",
		},
		text: {
			light: "#4e4e31",
			dark: "#fffc9f",
		},
	},
	HUNTER: {
		bg: {
			light: "#CFC3BE",
			dark: "#392217",
		},
		text: {
			light: "#6a3a2f",
			dark: "#e17963",
		},
	},
	INVADER: {
		bg: {
			light: "#CCC2CC",
			dark: "#362136",
		},
		text: {
			light: "#5c3b5e",
			dark: "#eaa8ee",
		},
	},
	INVOKER: {
		bg: {
			light: "#C3C6C7",
			dark: "#212628",
		},
		text: {
			light: "#394247",
			dark: "#b2cad4",
		},
	},
	MEDIC: {
		bg: {
			light: "#BBCCC4",
			dark: "#0f3021",
		},
		text: {
			light: "#364a42",
			dark: "#8bc0aa",
		},
	},
	SUMMONER: {
		bg: {
			light: "#CAC5C0",
			dark: "#2c221a",
		},
		text: {
			light: "#4b3e34",
			dark: "#ba9880",
		},
	},
	RITUALIST: {
		bg: {
			light: "#C6BBCD",
			dark: "#251133",
		},
		text: {
			light: "#562475",
			dark: "#bb4fff",
		},
	},
	WARDEN: {
		bg: {
			light: "#0a1014",
			dark: "#0a1014",
		},
		text: {
			light: "#a3bdd1",
			dark: "#a3bdd1",
		},
	},
} as const satisfies Record<
	string,
	{ bg: { light: string; dark: string }; text: { light: string; dark: string } }
>;

export { GAME_ID, ARCHETYPE_COLORS };
