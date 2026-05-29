import type { LosomnDungeon } from "#/games/remnant2/core/item-data/locations/losomn";
import type { NErudDungeon } from "#/games/remnant2/core/item-data/locations/nerud";
import type { WorldLocation } from "#/games/remnant2/core/item-data/locations/worlds";
import type { YaeshaDungeon } from "#/games/remnant2/core/item-data/locations/yaesha";

type Biome =
	| {
			name: string;
			world: "Losomn";
			dungeons: LosomnDungeon[];
			injectables: string[];
	  }
	| {
			name: string;
			world: `N'Erud`;
			dungeons: NErudDungeon[];
			injectables: string[];
	  }
	| {
			name: string;
			world: "Yaesha";
			dungeons: YaeshaDungeon[];
			injectables: string[];
	  };

const BIOMES: Biome[] = [
	{
		name: "Burning City",
		world: "Losomn",
		dungeons: [
			`Cotton's Kiln`,
			`Butcher's Quarter`,
			`Sunken Haunt`,
			`Derelict Lighthouse`,
		],
		injectables: [`Fiery Graveyard`, `Rookery`, `Oink`, `Ethereal Manor`],
	},
	{
		name: "Fae Palace",
		world: "Losomn",
		dungeons: [
			`Gilded Chambers`,
			`Council Chamber`,
			`Glistering Cloister`,
			`Pathway of the Fallen`,
			`Shattered Gallery`,
			`The Great Hall`,
		],
		injectables: [
			`As Above, So Below`,
			`Black and White`,
			`Silver and Gold`,
			`Reflection`,
		],
	},
	{
		name: "Floating Forests",
		world: "Yaesha",
		dungeons: [
			`The Nameless Nest`,
			`The Expanding Glade`,
			`Forgotten Field`,
			`Imperial Gardens`,
			`Deserted Atelier`,
			`Goddess's Rest`,
		],
		injectables: [`Broken Tomb`, `Tower`, `Island Jump`, `Shrine of the Doe`],
	},
	{
		name: "Jungles of Yaesha",
		world: "Yaesha",
		dungeons: [
			`Withering Weald`,
			`The Forbidden Grove`,
			`The Far Woods`,
			`Faithless Thicket`,
		],
		injectables: [`Dappled Glade`, `Koara Kuri Nest`, `Root Nexus`],
	},
	{
		name: "Losomn Sewers",
		world: "Losomn",
		dungeons: [
			`The Great Sewers`,
			`Harvester's Reach`,
			`Tiller's Rest`,
			`The Forgotten Commune`,
		],
		injectables: [`Rising Tides`, `Fae Nest`, `Dran Safe`, `Corpse Drop`],
	},
	{
		name: `N'Erud Underworld`,
		world: `N'Erud`,
		dungeons: [
			`The Putrid Domain`,
			`Vault of the Formless`,
			`Void Vessel Facility`,
			`The Hatchery`,
			`The Dark Conduit`,
			`Mucid Terrarium`,
			`Logistics Bridge`,
			`Stagnant Manufactory`,
		],
		injectables: [
			`Black Hole`,
			"Power Hub",
			`Robot Hangar`,
			`Sewage Facility`,
			`Shockwire`,
			`Store Room`,
			`The Claw`,
			`Security Drone Maze`,
		],
	},
	{
		name: `N'Erud Wasteland`,
		world: `N'Erud`,
		dungeons: [`Timeless Horizon`, `The Eon Vault`],
		injectables: [`Titan's Reach`, `Extraction Hub`],
	},
	{
		name: "Streets of Losomn",
		world: `Losomn`,
		dungeons: [
			`Morrow Parish`,
			`Brocwithe Quarter`,
			`Forsaken Quarter`,
			`Ironborough`,
		],
		injectables: [`Oracle's Refuge`, `Hewdas Clock`, `Briella's Garden`],
	},
	{
		name: `Towers of N'Erud`,
		world: `N'Erud`,
		dungeons: [
			`Astropath's Respite`,
			`Spectrum Nexus`,
			`Terminus Station`,
			`Tower of the Unseen`,
			`Detritus Foundry`,
			`Athenaeum Wek`,
		],
		injectables: [
			`Elevator Shaft`,
			`Remains Below`,
			`Stargazer's Tomb`,
			`Crop Lab`,
		],
	},
	{
		name: `Undead Tombs`,
		world: "Yaesha",
		dungeons: [
			`The Twisted Chantry`,
			`The Chimney`,
			`The Lament`,
			`Infested Abyss`,
		],
		injectables: [`Living Stone`, `Sarcophagus`, `Hidden Crypt`, `Pillar Hall`],
	},
	{
		name: `Ziggurats`,
		world: "Yaesha",
		dungeons: [`Endaira's End`, `Proving Grounds`, `Earthen Coliseum`],
		injectables: [`Hidden Chamber`, `Wind Hollow`, `Library`, `Moon's Path`],
	},
];

type BiomeForWorld<W extends WorldLocation> = Extract<
	(typeof BIOMES)[number],
	{ world: W }
>;

const filterBiomes = <W extends WorldLocation>(world: W) =>
	BIOMES.filter((b) => b.world === world) as BiomeForWorld<W>[];

type Injectable = (typeof BIOMES)[number]["injectables"][number];

type BiomeNameForWorld<W extends WorldLocation> = BiomeForWorld<W>["name"];

const LOSOMN_BIOMES = filterBiomes("Losomn");
const NERUD_BIOMES = filterBiomes(`N'Erud`);
const YAESHA_BIOMES = filterBiomes("Yaesha");

export {
	type BiomeNameForWorld,
	BIOMES,
	type Injectable,
	LOSOMN_BIOMES,
	NERUD_BIOMES,
	YAESHA_BIOMES,
};
