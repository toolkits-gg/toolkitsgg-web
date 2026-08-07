const ROOT_EARTH_DUNGEONS = [
	"Ashen Wasteland",
	"Corrupted Harbor",
	"Blackened Citadel",
	"Twilight Vale",
] as const satisfies string[];
type RootEarthDungeon = (typeof ROOT_EARTH_DUNGEONS)[number];

export { ROOT_EARTH_DUNGEONS, type RootEarthDungeon };
