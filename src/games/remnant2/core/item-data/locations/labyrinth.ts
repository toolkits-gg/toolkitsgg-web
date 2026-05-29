const LABYRINTH_DUNGEONS = [
	"Labyrinth",
	"Fractured Ingress",
	"Entangled Gauntlet",
	"Colosseum of Ruin",
] as const satisfies string[];
type LabyrinthDungeon = (typeof LABYRINTH_DUNGEONS)[number];

export { LABYRINTH_DUNGEONS, type LabyrinthDungeon };
