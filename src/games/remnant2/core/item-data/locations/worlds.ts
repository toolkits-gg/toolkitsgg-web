const WORLD_LOCATIONS = [
	"Losomn",
	`N'Erud`,
	"Yaesha",
	"Labyrinth",
	"Root Earth",
] as const satisfies string[];
type WorldLocation = (typeof WORLD_LOCATIONS)[number];

export { WORLD_LOCATIONS, type WorldLocation };
