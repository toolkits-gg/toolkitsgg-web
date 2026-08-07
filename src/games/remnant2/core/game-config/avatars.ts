import type { GameAvatar } from "#/features/game/types.ts";
import { ENEMIES } from "#/games/remnant2/core/enemy-data/remnant2-enemies";

const enemies: GameAvatar[] = ENEMIES.sort((a, b) =>
	a.name.localeCompare(b.name),
)
	.filter((enemy) => enemy.imageUrl)
	.map(({ slug, name, imageUrl, category }) => ({
		id: slug,
		name,
		imageUrl: imageUrl as string,
		category,
	}));

const AVATARS: GameAvatar[] = [
	...enemies,
	{
		id: "a3ygfg",
		name: "Alepsis Taura",
		imageUrl: "/avatars/alepsis_taura.jpg",
	},
	{
		id: "7ukbf2",
		name: "The Prototype",
		imageUrl: "/avatars/the_prototype.jpg",
	},
	{
		id: "AD7cnH",
		name: "Dran Nurse",
		imageUrl: "/avatars/dran_nurse.jpg",
	},
	{
		id: "4a5EAU",
		name: "Bridgekeeper Facepalm",
		imageUrl: "/avatars/bridgekeeper_facepalm.jpg",
	},
	{
		id: "7dG8vW",
		name: "Nimue Sleeping",
		imageUrl: "/avatars/nimue_sleeping.jpg",
	},
	{
		id: "yi3JVd",
		name: "Reggie",
		imageUrl: "/avatars/reggie.jpg",
	},
	{
		id: "cU86w5",
		name: "Andrew Ford",
		imageUrl: "/avatars/andrew_ford.jpg",
	},
	{
		id: "aPqs77",
		name: "Ava McCabe",
		imageUrl: "/avatars/ava_mccabe.jpg",
	},
	{
		id: "DmWRA8",
		name: "Bedel of the Vaunnt",
		imageUrl: "/avatars/bedel_of_the_vaunnt.jpg",
	},
	{
		id: "mjtk8P",
		name: "Bloodmoon Altar",
		imageUrl: "/avatars/bloodmoon_altar.jpg",
	},
	{
		id: "sox94R",
		name: "Bo",
		imageUrl: "/avatars/bo.jpg",
	},
	{
		id: "V8Gi2g",
		name: "Brabus",
		imageUrl: "/avatars/brabus.jpg",
	},
	{
		id: "frboD3",
		name: "Bridge Warden",
		imageUrl: "/avatars/bridge_warden.jpg",
	},
	{
		id: "i78SMB",
		name: "Cass",
		imageUrl: "/avatars/cass.jpg",
	},
	{
		id: "6UuaBk",
		name: "Clementine",
		imageUrl: "/avatars/clementine.jpg",
	},
	{
		id: "7zhk1e",
		name: "Custodian",
		imageUrl: "/avatars/custodian1.jpg",
	},
	{
		id: "3x8ox4",
		name: "Custodian",
		imageUrl: "/avatars/custodian2.jpg",
	},
	{
		id: "mpw37i",
		name: "Custodian",
		imageUrl: "/avatars/custodian3.jpg",
	},
	{
		id: "s7oo3c",
		name: "Custodian",
		imageUrl: "/avatars/custodian4.jpg",
	},
	{
		id: "DX77uX",
		name: 'Don "Rigs" Rigler',
		imageUrl: "/avatars/don_rigs_rigler.jpg",
	},
	{
		id: "2dR2wb",
		name: "Dr. Norah",
		imageUrl: "/avatars/dr_norah.jpg",
	},
	{
		id: "4KtJsH",
		name: "Dran in the Sewer",
		imageUrl: "/avatars/dran_in_the_sewer.jpg",
	},
	{
		id: "agQS6g",
		name: "Dran Oracle",
		imageUrl: "/avatars/dran_oracle.jpg",
	},
	{
		id: "w8m6tA",
		name: "Dran Preacher",
		imageUrl: "/avatars/dran_preacher.jpg",
	},
	{
		id: "P9ufkJ",
		name: "Drzyr Replicator",
		imageUrl: "/avatars/drzyr_replicator.jpg",
	},
	{
		id: "PSya6k",
		name: "Duane",
		imageUrl: "/avatars/duane.jpg",
	},
	{
		id: "dLMc7Z",
		name: "Dwell",
		imageUrl: "/avatars/dwell.jpg",
	},
	{
		id: "AXavV7",
		name: "Earl",
		imageUrl: "/avatars/earl.jpg",
	},
	{
		id: "x2nDCa",
		name: "Elowen",
		imageUrl: "/avatars/elowen.jpg",
	},
	{
		id: "EuqP9e",
		name: "Feast Master",
		imageUrl: "/avatars/feast_master.jpg",
	},
	{
		id: "gn3cr2",
		name: "Crawler",
		imageUrl: "/avatars/fodder_crawler1.jpg",
	},
	{
		id: "ao063c",
		name: "Crawler",
		imageUrl: "/avatars/fodder_crawler2.jpg",
	},
	{
		id: "i1ea4t",
		name: "Doe",
		imageUrl: "/avatars/doe_face.jpg",
	},
	{
		id: "aav3y6",
		name: "Dog",
		imageUrl: "/avatars/dog_face.jpg",
	},
	{
		id: "CLni6o",
		name: "Jester",
		imageUrl: "/avatars/jester.jpg",
	},
	{
		id: "8Un35y",
		name: "Leywise",
		imageUrl: "/avatars/leywise.jpg",
	},
	{
		id: "R48rwY",
		name: "Likh",
		imageUrl: "/avatars/likh.jpg",
	},
	{
		id: "m7pkVp",
		name: "Meidra",
		imageUrl: "/avatars/meidra.jpg",
	},
	{
		id: "zSPk65",
		name: "Mudtooth",
		imageUrl: "/avatars/mudtooth.jpg",
	},
	{
		id: "DWx5eX",
		name: "Nimue",
		imageUrl: "/avatars/nimue.jpg",
	},
	{
		id: "5NEkfE",
		name: "Riewen",
		imageUrl: "/avatars/riewen.jpg",
	},
	{
		id: "o3wdy2",
		name: "Shrimp",
		imageUrl: "/avatars/fodder_shrimp1.jpg",
	},
	{
		id: "o99d9a",
		name: "Shrimp",
		imageUrl: "/avatars/fodder_shrimp2.jpg",
	},
	{
		id: "m9ibdk",
		name: "Shrimp",
		imageUrl: "/avatars/fodder_shrimp3.jpg",
	},
	{
		id: "0b9i50",
		name: "Shrimp Sniper",
		imageUrl: "/avatars/shrimp_sniper1.jpg",
	},
	{
		id: "q8fwru",
		name: "Shrimp Sniper",
		imageUrl: "/avatars/shrimp_sniper2.jpg",
	},
	{
		id: "owto03",
		name: "Spark",
		imageUrl: "/avatars/spark.jpg",
	},
	{
		id: "UZq9G2",
		name: "The Custodian",
		imageUrl: "/avatars/the_custodian.jpg",
	},
	{
		id: "QnngE4",
		name: "The Empress",
		imageUrl: "/avatars/the_empress.jpg",
	},
	{
		id: "VKhAk3",
		name: "The Flautist",
		imageUrl: "/avatars/the_flautist.jpg",
	},
	{
		id: "ECi3DP",
		name: "The Keeper",
		imageUrl: "/avatars/the_keeper.jpg",
	},
	{
		id: "YLnz3c",
		name: "Wallace",
		imageUrl: "/avatars/wallace.jpg",
	},
	{
		id: "T4xD6v",
		name: "Whispers",
		imageUrl: "/avatars/whispers.jpg",
	},
];

export { AVATARS };
