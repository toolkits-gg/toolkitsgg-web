/**
 * Community defined item tags for Remnant 2.
 * These tags are created and maintained by the player community
 * and allow for better categorization of items that may not be clear
 * from the item description, or that have special interactions.
 */
const COMMUNITY_ITEM_TAGS = [
	{
		token: "AOE/Aura",
		color: {
			light: "#1f7a5c",
			dark: "#66ffcc",
		},
		description: "This item benefits from AOE or Aura size increasing effects.",
	},
	// * We keep this here as well as in the description tokens because of the need
	// * to specify that the Handler skills apply bleed.
	{
		token: "Attack Dog",
		color: {
			light: "#C92C0C",
			dark: "#589961",
		},
		description: "Dog applies BLEEDING to enemies.",
	},
	{
		token: "Guard Dog",
		color: {
			light: "#C92C0C",
			dark: "#589961",
		},
		description: "Dog applies BLEEDING to enemies.",
	},
	{
		token: "Support Dog",
		color: {
			light: "#C92C0C",
			dark: "#589961",
		},
		description: "Dog applies BLEEDING to enemies.",
	},
	{
		token: "Explosive Damage",
		color: {
			light: "#c83737",
			dark: "#ff7575",
		},
		description: "All, or part, of this item's effect deals Explosive Damage.",
	},
	{
		token: "Multiplicative",
		color: {
			light: "#956E44",
			dark: "#FDBA74",
		},
		description: "Damage is multiplicative with different sources of damage.",
	},
	{
		token: "Multiplicative Debuffs",
		color: {
			light: "#B05050",
			dark: "#F87171",
		},
		description:
			"Counts as a debuff making it multiplicative with different sources of damage.",
	},
	{
		token: "Misty Step",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description:
			"Grants Misty Step evade when worn in combination with other Misty Step items.",
	},
	{
		token: "Lodestone Set",
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description:
			"Wearing the Lodestone Ring with the Lodestone Crown will grant immunity to all BLIGHT Status Effects. ",
	},
	{
		token: `Navigator's Set`,
		color: {
			light: "#6d6650",
			dark: "#fff1bc",
		},
		description: `Wearing either Navigator's Pendant alongside the Navigator's Helm gives +15 BLIGHT resistance.`,
	},
	{
		token: "PRERELEASE",
		color: {
			light: "#646b00",
			dark: "#ecfc00",
		},
		description: `This is prerelease content. Information might not be accurate or change. Numbers aren't final.`,
	},
	{
		token: "Bug",
		color: {
			light: "#5e6600",
			dark: "#ecff00",
		},
		description:
			"This item is currently bugged and MAY not function as expected. Check remnant.wiki for more information.",
	},
] as const satisfies {
	token: string;
	color: {
		light: string;
		dark: string;
	};
	description: string | undefined;
}[];

export { COMMUNITY_ITEM_TAGS };
