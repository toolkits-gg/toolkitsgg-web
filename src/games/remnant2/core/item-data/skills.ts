import type { BaseRemnant2Item } from "#/games/remnant2/core/types";

type Remnant2SkillItem = BaseRemnant2Item & {
	cooldown?: number;
};

const SKILLS: Remnant2SkillItem[] = [
	// #region Alchemist
	{
		category: "SKILL",
		name: "Vial: Stone Mist",
		internalSlug: "Skill_AlchemistVial_StoneMist_C",
		imageUrl: "items/skills/alchemist_stonemist.png",
		id: "y7ia9t",
		dlc: "BASE",
		description: [
			"Creates a mysterious vapor cloud which lasts 10s and applies STONESKIN.",
			"PRESS: Slam Vial on the ground, creating the effect at the Alchemist's feet.",
			"HOLD & RELEASE: Aim and throw the Vial causing the same effect where it lands.",
		],
		cooldown: 75,
		inlineTags: ["Stoneskin"],
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Vial:_Stone_Mist",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Alchemist",
			},
		},
	},
	{
		category: "SKILL",
		name: "Vial: Frenzy Dust",
		internalSlug: "Skill_AlchemistVial_FrenzyDust_C",
		imageUrl: "items/skills/alchemist_frenzydust.png",
		id: "xsniv3",
		dlc: "BASE",
		description: [
			"Creates a mysterious vapor cloud which lasts 10s and applies FRENZIED.",
			"PRESS: Slam Vial on the ground, creating the effect at the Alchemist's feet.",
			"HOLD & RELEASE: Aim and throw the Vial causing the same effect where it lands.",
		],
		inlineTags: ["Frenzied"],
		cooldown: 75,
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Vial:_Frenzy_Dust",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Alchemist",
			},
		},
	},
	{
		category: "SKILL",
		name: "Vial: Elixir of Life",
		internalSlug: "Skill_AlchemistVial_ElixirOfLife_C",
		imageUrl: "items/skills/alchemist_elixiroflife.png",
		id: "76554i",
		dlc: "BASE",
		description: [
			"Creates a mysterious vapor cloud which lasts 10s and applies LIVING WILL.",
			"Revived allies cannot be affected by Living Will for 180s. Resets at Worldstone or on death.",
			"PRESS: Slam Vial on the ground, creating the effect at the Alchemist's feet.",
			"HOLD & RELEASE: Aim and throw the Vial causing the same effect where it lands.",
		],
		inlineTags: ["Living Will"],
		cooldown: 90,
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Vial:_Elixir_of_Life",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Alchemist",
			},
		},
	},
	// #region Archon
	{
		category: "SKILL",
		name: "Reality Rune",
		internalSlug: "Skill_RealityRune_C",
		imageUrl: "items/skills/archon_realityrune.png",
		id: "i3ddi7",
		dlc: "BASE",
		searchableTags: ["Status Effect", "Damage Reduction"],
		description: [
			"Conjures a 7m protective dome which applies SLOW to any enemy or enemy projectile. Allies inside gain 25% Damage Reduction and automatically generate 50 Mod Power per second. Lasts 15s.",
		],
		cooldown: 75,
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Reality_Rune",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Archon",
			},
		},
	},
	{
		category: "SKILL",
		name: "Chaos Gate",
		internalSlug: "Skill_ChaosGate_C",
		imageUrl: "items/skills/archon_chaosgate.png",
		id: "9w7c5j",
		dlc: "BASE",
		description: [
			"Conjures a 7m unstable zone which grants stacks of UNBRIDLED CHAOS. Lasts 20s.",
			"Having any stacks grants 10% Mod Generation.",
		],
		cooldown: 85,
		inlineTags: ["Unbridled Chaos"],
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Chaos_Gate",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Archon",
			},
		},
	},
	{
		category: "SKILL",
		name: "Havoc Form",
		internalSlug: "Skill_HavocForm_C",
		imageUrl: "items/skills/archon_havocform.png",
		id: "y72au6",
		dlc: "BASE",
		description: [
			"Unleashes the power of the Labyrinth to empower the caster with new abilities. Lasts 30s.",
			"Duration is reduced when Havoc Form special abilities are used.",
			"FIRE: Blasts Lightning Tendrils from the Archon's hand, dealing 48 SHOCK Damage every 0.35s second to targets within 15m.",
			"AIM: Raises a 3m Energy Shield which reduces incoming damage to all allies by 50%.",
			"DODGE: Performs a Blink Evade that deals 150 SHOCK damage to enemies within 5m.",
		],
		cooldown: 90,
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Havoc_Form",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Archon",
			},
		},
	},
	// #region Challenger
	{
		category: "SKILL",
		name: "War Stomp",
		internalSlug: "Skill_WarStomp_C",
		imageUrl: "items/skills/challenger_warstomp.png",
		id: "qnz5iw",
		dlc: "BASE",
		description: [
			"Creates a high-impact tremor that deals 150 damage and additional stagger in a forward cone up to 7.5m. Deals damage in all directions at point blank range.",
		],
		cooldown: 50,
		communityTags: [`AOE/Aura`, `Explosive Damage`],
		wikiUrl: "https://remnant2.wiki.gg/War_Stomp",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Challenger",
			},
		},
	},
	{
		category: "SKILL",
		name: "Juggernaut",
		internalSlug: "Skill_Battlecry_Juggernaut_C",
		imageUrl: "items/skills/challenger_juggernaut.png",
		id: "p7x9pq",
		dlc: "BASE",
		description: [
			"Become nearly unstoppable, gaining 3 Stacks of BULWARK, 15% Movement, Melee Speed, and Reduced Stamina Cost. Increases Melee damage by 50%. Stagger Level reduced by 1. Lasts 25s.",
		],
		cooldown: 60,
		wikiUrl: "https://remnant2.wiki.gg/Juggernaut",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Challenger",
			},
		},
	},
	{
		category: "SKILL",
		name: "Rampage",
		internalSlug: "Skill_Rampage_C",
		imageUrl: "items/skills/challenger_rampage.png",
		id: "wyw9r4",
		dlc: "BASE",
		description: [
			"Enters a heightened state of battle which increases Fire Rate by 10%, Reload Speed by 25%, and Movement Speed by 15%. Lasts 10s.",
			"Kills and dealing significant damage grant 1 Stack of RAGE which increases Ranged Damage by 2.5% per Stack. Upon reaching 10 Stacks, the Challenger goes BERSERK, which reloads their current firearm and doubles Rampage effects for 15s.",
		],
		cooldown: 90,
		wikiUrl: "https://remnant2.wiki.gg/Rampage",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Challenger",
			},
		},
	},
	// #region Engineer
	{
		category: "SKILL",
		name: "Heavy Weapon: Vulcan",
		internalSlug: "Skill_Deployable_Gatling_C",
		imageUrl: "items/skills/engineer_gatling.png",
		id: "pgmn4v",
		dlc: "BASE",
		description: [
			"PRESS: Deploys a Vulcan Cannon Turret which lasts until its Ammo is exhausted. Turrets that can aim will prioritize targets that the player Aims at. Press SKILL again to enable autonomous targeting.",
			"HOLD: Deploys to Heavy Carry Mode. If Engineer Prime is available, will Overclock the weapon if already in hand or on the battlefield.",
			"DOUBLE PRESS: The weapon is reclaimed, returning 75% of its remaining Ammo.",
			"Heavy Weapon Ammo is regenerated by 1.02% every second, and Heavy Weapons can only be deployed if at least 25% Ammo is available.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Heavy_Weapon:_Vulcan",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Engineer",
			},
		},
	},
	{
		category: "SKILL",
		name: "Heavy Weapon: Flamethrower",
		internalSlug: "Skill_Deployable_FlameThrower_C",
		imageUrl: "items/skills/engineer_flamethrower.png",
		id: "6fk8ea",
		dlc: "BASE",
		description: [
			"PRESS: Deploys a Flamethrower Turret which lasts until its Ammo is exhausted. Turrets that can aim will prioritize targets that the player Aims at. Press SKILL again to enable autonomous targeting.",
			"HOLD: Deploys to Heavy Carry Mode. If Engineer Prime is available, will Overclock the weapon if already in hand or on the battlefield.",
			"DOUBLE PRESS: The weapon is reclaimed, returning 75% of its remaining Ammo.",
			"Heavy Weapon Ammo is regenerated by 1.02% every second, and Heavy Weapons can only be deployed if at least 25% Ammo is available.",
		],
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Heavy_Weapon:_Flamethrower",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Engineer",
			},
		},
	},
	{
		category: "SKILL",
		name: "Heavy Weapon: Impact Cannon",
		internalSlug: "Skill_Deployable_ImpactCannon_C",
		imageUrl: "items/skills/engineer_impactcannon.png",
		id: "ki92op",
		dlc: "BASE",
		description: [
			"PRESS: Deploys a Impact Cannon Turret which lasts until its Ammo is exhausted. Turrets that can aim will prioritize targets that the player Aims at. Press SKILL again to enable autonomous targeting.",
			"HOLD: Deploys to Heavy Carry Mode. If Engineer Prime is available, will Overclock the weapon if already in hand or on the battlefield.",
			"DOUBLE PRESS: The weapon is reclaimed, returning 75% of its remaining Ammo.",
			"Heavy Weapon Ammo is regenerated by 1.02% every second, and Heavy Weapons can only be deployed if at least 25% Ammo is available.",
		],
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Heavy_Weapon:_Impact_Cannon",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Engineer",
			},
		},
	},
	// #region Explorer
	{
		category: "SKILL",
		name: "Plainswalker",
		internalSlug: "Skill_Plainswalker_C",
		imageUrl: "items/skills/explorer_plainswalker.png",
		id: "a585sp",
		dlc: "BASE",
		description: [
			"Increases Movement Speed by 20% and reduces Stamina Cost by 80% for all allies. Lasts 30s.",
		],
		cooldown: 60,
		wikiUrl: "https://remnant2.wiki.gg/Plainswalker",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Explorer",
			},
		},
	},
	{
		category: "SKILL",
		name: "Gold Digger",
		internalSlug: "Skill_GoldDigger_C",
		imageUrl: "items/skills/explorer_golddigger.png",
		id: "a2cik2",
		dlc: "BASE",
		description: [
			"Dig into the ground to spring a fountain which grants a random buff. Fountains last 45s and their buff lasts 20s.",
			"Fountains can grant either: 10% increased All Damage dealt, 15% Damage Reduction, 2 Health Regeneration per second, or HASTE.",
		],
		cooldown: 45,
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Gold_Digger",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Explorer",
			},
		},
	},
	{
		category: "SKILL",
		name: "Fortune Hunter",
		internalSlug: "Skill_FortuneHunter_C",
		imageUrl: "items/skills/explorer_fortunehunter.png",
		id: "dajt58",
		dlc: "BASE",
		description: [
			"Increases the Explorer's Treasure Sense to reveal special items within 40m for all allies. Lasts 60s.",
		],
		cooldown: 90,
		wikiUrl: "https://remnant2.wiki.gg/Fortune_Hunter",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Explorer",
			},
		},
	},
	// #region Gunslinger
	{
		category: "SKILL",
		name: "Quick Draw",
		internalSlug: "Skill_Aimable_QuickDraw_C",
		imageUrl: "items/skills/gunslinger_quickdraw.png",
		id: "qdxjt7",
		dlc: "BASE",
		description: [
			"Pull out your trusty side piece and upload up to 6 Critical Shots from the hip. Each shot deals 52 base damage and double stagger value.",
			"PRESS: Instantly fires towards all enemies in view within 25m. Upon release, rounds will be divided evenly among all targets.",
			"HOLD & RELEASE: Allows manual Aim and fires one single powerful shot upon release.",
		],
		cooldown: 40,
		wikiUrl: "https://remnant2.wiki.gg/Quick_Draw",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Gunslinger",
			},
		},
	},
	{
		category: "SKILL",
		name: "Sidewinder",
		internalSlug: "Skill_Sidewinder_C",
		imageUrl: "items/skills/gunslinger_sidewinder.png",
		id: "jn34u8",
		dlc: "BASE",
		description: [
			"Calls upon the power of the Desert Sidewinder snake to increase ADS Movement Speed by 50% and Draw/Swap Speed by 35%. Cycling weapons will automatically reload incoming Firearms. When a Weapon Swap provides Ammo to an incoming weapon, Duration is reduced by 6s. Lasts 60s.",
		],
		cooldown: 50,
		wikiUrl: "https://remnant2.wiki.gg/Sidewinder",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Gunslinger",
			},
		},
	},
	{
		category: "SKILL",
		name: "Bulletstorm",
		internalSlug: "Skill_Bulletstorm_C",
		imageUrl: "items/skills/gunslinger_bulletstorm.png",
		id: "xpqq62",
		dlc: "BASE",
		searchableTags: [
			"Fire Rate",
			"Reload Speed",
			"Critical Chance",
			"Projectile Speed",
		],
		description: [
			"Unleashes the full power and speed of the Gunslinger. Increases Fire Rate 20% and Reload Speed 50% of all ranged weapons. Lasts 20s.",
			"Single Shot Weapons become fully-automatic. Kills instantly reload the current weapon.",
			"Instead of becoming fully-automatic, Bows and Crossbows gain 15% Critical Chance and 50% increased Projectile Speed.",
		],
		cooldown: 60,
		wikiUrl: "https://remnant2.wiki.gg/Bulletstorm",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Gunslinger",
			},
		},
	},
	// #region Handler
	{
		category: "SKILL",
		name: "Guard Dog",
		internalSlug: "Skill_GuardDog_C",
		imageUrl: "items/skills/handler_guard.png",
		id: "gpr2fw",
		dlc: "BASE",
		description: [
			"Companion will follow the Handler and generate 15% increased Threat while attacking. All damage to them is reduced by 20%.",
			"SINGLE PRESS: Companion engages enemies near the targeted location.",
			"DOUBLE TAP: Companion returns to the Handler and remains by their side.",
			"HOLD: Howl reduces damage by 15% to all allies within 20m and the Companion generates additional Threat. Lasts 20s.",
		],
		cooldown: 90,
		communityTags: [`AOE/Aura`, `Guard Dog`],
		wikiUrl: "https://remnant2.wiki.gg/Guard_Dog",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Handler",
			},
		},
	},
	{
		category: "SKILL",
		name: "Support Dog",
		internalSlug: "Skill_SupportDog_Command_C",
		imageUrl: "items/skills/handler_support.png",
		id: "jz6x2w",
		dlc: "BASE",
		description: [
			"Companion will follow the Handler and continuously heal allies within 3.5m for 0.25% of Max Health per second.",
			"SINGLE PRESS: Companion engages enemies near the targeted location.",
			"DOUBLE TAP: Companion returns to the Handler and remains by their side.",
			"HOLD: Howl grants 2% of Max Health per second and 25% increased Movement Speed to all allies within 20m. Lasts 25s.",
		],
		cooldown: 90,
		communityTags: [`AOE/Aura`, `Support Dog`],
		wikiUrl: "https://remnant2.wiki.gg/Support_Dog",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Handler",
			},
		},
	},
	{
		category: "SKILL",
		name: "Attack Dog",
		internalSlug: "Skill_AttackDog_C",
		imageUrl: "items/skills/handler_attack.png",
		id: "8trtzh",
		dlc: "BASE",
		description: [
			"Companion will follow the Handler and deal 20% additional damage.",
			"SINGLE PRESS: Companion engages enemies near the targeted location.",
			"DOUBLE TAP: Companion returns to the Handler and remains by their side.",
			"HOLD: Howl increases damage by 20% for all allies within 20m. Lasts 20s.",
		],
		cooldown: 90,
		communityTags: [`AOE/Aura`, `Attack Dog`],
		wikiUrl: "https://remnant2.wiki.gg/Attack_Dog",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Handler",
			},
		},
	},
	// #region Hunter
	{
		category: "SKILL",
		name: `Hunter's Mark`,
		internalSlug: "Skill_HuntersMark_C",
		imageUrl: "items/skills/hunter_huntersmark.png",
		id: "jg82hi",
		dlc: "BASE",
		searchableTags: ["Critical Chance", "Ranged Damage", "Melee Damage"],
		description: [
			"Increases the Hunter's spatial awareness by casting an Aura that automatically applies MARK to all enemies within 35m. While senses are heightened, Hunter also gains 15% increased Ranged and Melee damage. Lasts 25s.",
		],
		cooldown: 70,
		inlineTags: ["MARK"],
		wikiUrl: "https://remnant2.wiki.gg/Hunter's_Mark",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Hunter",
			},
		},
	},
	{
		category: "SKILL",
		name: `Hunter's Focus`,
		internalSlug: "Skill_HuntersFocus_C",
		imageUrl: "items/skills/hunter_focus.png",
		id: "5jh6qr",
		dlc: "BASE",
		searchableTags: [
			"Spread",
			"Ranged Damage",
			"Weakspot Damage",
			"Critical Chance",
			"Recoil",
		],
		description: [
			"Continuously Aiming Down Sights uninterrupted and without shooting for 0.5s causes the Hunter to enter a FOCUSED state. Wears off after 0.75s of leaving Aim. Lasts 25s.",
			"While FOCUSED, Aiming at enemies will automatically apply MARK.",
			"FOCUSED state can last up to 10s after the Skill duration expires.",
		],
		cooldown: 50,
		inlineTags: ["MARK", "FOCUSED"],
		wikiUrl: "https://remnant2.wiki.gg/Hunter's_Focus",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Hunter",
			},
		},
	},
	{
		category: "SKILL",
		name: `Hunter's Shroud`,
		internalSlug: "Skill_HuntersShroud_C",
		imageUrl: "items/skills/hunter_huntersshroud.png",
		id: "ufkx9q",
		dlc: "BASE",
		searchableTags: [
			"Ranged Damage",
			"Melee Damage",
			"Critical Chance",
			"Melee Hit",
		],
		communityTags: ["AOE/Aura"],
		description: [
			"Hunter becomes Shrouded, reducing enemy awareness and making them harder to hit while moving. Attacking or activating a Mod or Skill will instantly exit Shroud.",
			"Exiting Shroud applies MARK to all enemies within 10m and grants AMBUSH to the Hunter for 2s.",
			"Hunter will automatically Shroud again after 1.15s if no offensive actions are performed.",
			"Lasts 15s.",
		],
		cooldown: 90,

		wikiUrl: "https://remnant2.wiki.gg/Hunter's_Shroud",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Hunter",
			},
		},
	},
	// #region Invader
	{
		category: "SKILL",
		name: "Void Cloak",
		internalSlug: "Skill_VoidCloak_C",
		imageUrl: "items/skills/invader_voidcloak.png",
		id: "hvcxo8",
		dlc: "BASE",
		description: [
			"Automatically Perfect Dodge incoming direct damage for 60s. Each auto-evade reduces timer by 33% - 100% based on damage absorbed and spawns a Decoy for 3s.",
		],
		cooldown: 75,
		wikiUrl: "https://remnant2.wiki.gg/Void_Cloak",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Invader",
			},
		},
	},
	{
		category: "SKILL",
		name: "Worm Hole",
		internalSlug: "Skill_WormHole_C",
		imageUrl: "items/skills/invader_wormhole.png",
		id: "y9oqq6",
		dlc: "BASE",
		description: [
			"Warps the caster forward through space-time. The next Melee or Ranged attack within 5s will deal 300% increased damage. Counts as a Perfect Dodge.",
			"Holding the Skill button will show the targeting device. If an enemy is directly targeted, the caster will emerge behind them.",
		],
		cooldown: 35,
		wikiUrl: "https://remnant2.wiki.gg/Worm_Hole",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Invader",
			},
		},
	},
	{
		category: "SKILL",
		name: "Reboot",
		internalSlug: "Skill_Reboot_C",
		imageUrl: "items/skills/invader_reboot.png",
		id: "xx6sib",
		dlc: "BASE",
		searchableTags: [
			"Stamina",
			"Health",
			"Status Effect",
			"Movement Speed",
			"Damage Reduction",
		],
		description: [
			"Initiates a Data Backup of the caster's current Health, Stamina, Relic Charges, Ammo, and Negative Status Effects, which are stored for 30s.",
			"While the Backup is active, increases Movement Speed by 15% and Damage Reduction by 10%.",
			"Reactivating the Skill restores all saved values from the Backup and spawns a Decoy which lasts 3s.",
		],
		cooldown: 55,
		wikiUrl: "https://remnant2.wiki.gg/Reboot",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Invader",
			},
		},
	},
	// #region Invoker
	{
		category: "SKILL",
		name: "Way of Kaeula",
		internalSlug: "Skill_WayOfWater_C",
		imageUrl: "items/skills/invoker_wayofkaeula.png",
		id: "h4B9dD",
		dlc: "DLC2",
		searchableTags: [],
		description: [
			"Invoke Kaeula to cast a Tidal Wave, dealing 150 Elemental damage and conjuring a 30m Rainstorm for 15s. Allies inside Rainstorm gain HASTE. Enemies inside Rainstorm gain DRENCHED for 10s.",
		],
		cooldown: 120,
		inlineTags: ["Haste", "Drenched"],
		wikiUrl: "https://remnant2.wiki.gg/Way_of_Kaeula",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Invoker",
			},
		},
	},
	{
		category: "SKILL",
		name: "Way of Meidra",
		internalSlug: "Skill_WayOfForest_C",
		imageUrl: "items/skills/invoker_wayofmeidra.png",
		id: "7DnBmE",
		dlc: "DLC2",
		searchableTags: ["Heal", "Lifesteal"],
		description: [
			"Invoke Meidra to heal all allies for 20% Max Health over 1.5s and conjure a 20m Forest Growth for 15s. After fully blooming, allies in the Forest Growth heal 2% Max Health per second and gain 3% of base damage dealt as Lifesteal. Enemies inside Forest Growth gain GLOOM for 10s.",
			"Cooldown: 120s.",
		],
		cooldown: 120,
		inlineTags: ["Gloom", "Lifesteal"],
		communityTags: ["AOE/Aura"],
		wikiUrl: "https://remnant2.wiki.gg/Way_of_Meidra",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Invoker",
			},
		},
	},
	{
		category: "SKILL",
		name: "Way of Lydusa",
		internalSlug: "Skill_WayOfSand_C",
		imageUrl: "items/skills/invoker_wayoflydusa.png",
		id: "T2xA6c",
		dlc: "DLC2",
		searchableTags: ["Critical Chance", "Critical Damage", "Elemental Damage"],
		communityTags: ["AOE/Aura"],
		description: [
			"Invoke Lydusa to infuse Ranged and Melee Damage with the power to apply BRITTLE, allowing the Invoker to generate Sand Devils through damage or kills. Lasts 15s",
			"Reactivating the skill consumes all Sand Devils generated and casts a 15m Sand Blast dealing 100 Elemental Damage per charge. Max 10 charges.",
		],
		cooldown: 120,
		inlineTags: ["Brittle"],
		wikiUrl: "https://remnant2.wiki.gg/Way_of_Lydusa",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Invoker",
			},
		},
	},
	// #region Medic
	{
		category: "SKILL",
		name: "Wellspring",
		internalSlug: "Skill_Wellspring_C",
		imageUrl: "items/skills/medic_wellspring.png",
		id: "7vtxrx",
		dlc: "BASE",
		description: [
			"The Medic channels healing energy into their fist, punching a hole into the ground to create a 3m Healing Spring AOE which restores 10 Health per second and greatly increases Blight Decay Rate. Lasts 15s.",
		],
		cooldown: 60,
		communityTags: [`AOE/Aura`, `Explosive Damage`],
		wikiUrl: "https://remnant2.wiki.gg/Wellspring",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Medic",
			},
		},
	},
	{
		category: "SKILL",
		name: "Healing Shield",
		internalSlug: "Skill_HealingSurge_C",
		imageUrl: "items/skills/medic_healingshield.png",
		id: "8pu6y2",
		dlc: "BASE",
		description: [
			"The Medic quickly expels healing energy to SHIELD all allies within 25m for 100% of their Max Health for 10s. While shielded, allies regenerate 20% of their Max Health over the duration.",
		],
		cooldown: 100,
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Healing_Shield",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Medic",
			},
		},
	},
	{
		category: "SKILL",
		name: "Redemption",
		internalSlug: "Skill_Redemption_C",
		imageUrl: "items/skills/medic_redemption.png",
		id: "zs77cb",
		dlc: "BASE",
		description: [
			"The Medic unleashes a 30m shockwave that revives downed allies and restores 50% Max Health over 10s. For each additional 1s holding the SKILL button, the heal gains an additional 50% (up to 200% max).",
			"Revived allies will only receive 50% of the healing amount. If revived, allies cannot be revived again by Redemption for another 180s. Resets at Worldstone or on death.",
		],
		cooldown: 120,
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Redemption",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Medic",
			},
		},
	},
	// #region Ritualist
	{
		category: "SKILL",
		name: "Eruption",
		internalSlug: "Skill_Eruption_C",
		imageUrl: "items/skills/ritualist_eruption.png",
		id: "amqa83",
		dlc: "BASE",
		searchableTags: ["Status Effect"],
		description: [
			"Creates 1m explosion for 50 damage on all enemies within 15m. Explosion Radius and Damage increases 100% for each unique Status Effect on the target. Refreshes all current Status Effects on the target.",
		],
		cooldown: 40,
		communityTags: [`AOE/Aura`, `Explosive Damage`],
		wikiUrl: "https://remnant2.wiki.gg/Eruption",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Ritualist",
			},
		},
	},
	{
		category: "SKILL",
		name: "Miasma",
		internalSlug: "Skill_Miasma_C",
		imageUrl: "items/skills/ritualist_miasma.png",
		id: "3er3og",
		dlc: "BASE",
		searchableTags: ["Status Effect"],
		description: [
			"Casts an AOE burst that applies BLEEDING, BURNING, OVERLOADED, and CORRODED to all enemies within 15m, and dealing a total 300 base damage. Lasts 10s.",
		],
		cooldown: 45,
		communityTags: [`AOE/Aura`],
		wikiUrl: "https://remnant2.wiki.gg/Miasma",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Ritualist",
			},
		},
	},
	{
		category: "SKILL",
		name: "Deathwish",
		internalSlug: "Skill_Deathwish_C",
		imageUrl: "items/skills/ritualist_deathwish.png",
		id: "ux5f9v",
		dlc: "BASE",
		searchableTags: ["All Damage", "Lifesteal"],
		description: [
			"Negates all healing to self. Drain 300% Health over 20s. Increases all Damage by 50% and grants 10% Base Damage dealt as Lifesteal.",
		],
		cooldown: 90,
		wikiUrl: "https://remnant2.wiki.gg/Deathwish",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Ritualist",
			},
		},
	},
	// #region Summoner
	{
		category: "SKILL",
		name: "Minion: Hollow",
		internalSlug: "Skill_SummonHollowMinion_C",
		imageUrl: "items/skills/summoner_hollow.png",
		id: "kk4yre",
		dlc: "BASE",
		description: [
			"PRESS: Summons a Root Hollow Minion to fight by your side. Costs 15% of Max Health to summon, but will not kill Summoner. Max (2).",
			"HOLD: SACRIFICE Root Hollow Minions to explode, dealing 150 damage within 5m. Reduces Skill Cooldown by up to 50% based on remaining Health of each Minion Sacrificed.",
		],
		cooldown: 30,
		communityTags: [`AOE/Aura`, `Explosive Damage`],
		wikiUrl: "https://remnant2.wiki.gg/Minion:_Hollow",
		location: undefined,
		searchableTags: ["Reduce Skill Cooldown", "Summon"],
		linkedItems: {
			archetype: {
				name: "Summoner",
			},
		},
	},
	{
		category: "SKILL",
		name: "Minion: Flyer",
		internalSlug: "Skill_SummonFlyerMinion_C",
		imageUrl: "items/skills/summoner_flyer.png",
		id: "o7pvqx",
		dlc: "BASE",
		description: [
			"Summons a Root Flyer Minion to fight by your side. Costs 10% of Max Health to summon, but will not kill Summoner. Max (2).",
			"HOLD: SACRIFICE Root Flyer Minions, dealing 50 Damage within 3m and spawning 3 homing projectiles which explode on contact for 150 damage each.",
			"Reduces Skill Cooldown by up to 50% based on remaining Health of each Minion Sacrificed.",
		],
		cooldown: 45,
		communityTags: [`AOE/Aura`, `Explosive Damage`],
		wikiUrl: "https://remnant2.wiki.gg/Minion:_Flyer",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Summoner",
			},
		},
	},
	{
		category: "SKILL",
		name: "Minion: Reaver",
		internalSlug: "Skill_SummonBruteMinion_C",
		imageUrl: "items/skills/summoner_reaver.png",
		id: "gs8zdv",
		dlc: "BASE",
		description: [
			"PRESS: Summons a Root Reaver Minion to fight by your side. Costs 35% of Max Health to summon, but will not kill Summoner. Max (1).",
			"HOLD: SACRIFICE Root Reaver Minion, dealing 200 Damage within 6m and spawning Spore Bombs which bounce and explode on contact for 200 damage each.",
			"Reduces Skill Cooldown by up to 50% based on remaining Health of Minion.",
		],
		communityTags: [`AOE/Aura`, `Explosive Damage`],
		searchableTags: ["Reduce Skill Cooldown", "Summon"],
		wikiUrl: "https://remnant2.wiki.gg/Minion:_Reaver",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Summoner",
			},
		},
	},
	// #region Warden
	{
		category: "SKILL",
		name: "Drone: Shield",
		internalSlug: "Skill_DroneShield_C",
		imageUrl: "items/skills/warden_drone_shield.png",
		id: "wqicx7",
		dlc: "DLC3",
		searchableTags: ["Damage Reduction"],
		communityTags: [],
		description: [
			"Deploy Shield Drone with 100 Energy Reserves to follow and protect its Warded Target.",
			"The Warded Target gains 10% increased Damage Reduction. When the Warded Target is not at Max SHIELD Capacity, the Drone consumes 25 Energy to grant a SHIELD for 8% of the target's Max Health once every 2s. Shields from the Drone last until removed by damage, altering the Warded Target, or the drone is Stowed.",
			"When idle for 5s, the Drone goes Dormant, gaining 1% Energy Regen per second. When depleted of Energy the Drone goes Inactive, then gains 1.5% Energy Regen per second until fully recharged.",
			"SINGLE PRESS: Drone alters its Warded Target to the targeted ally. Max 1 Shield Drone per target.",
			"DOUBLE TAP: Drone returns to the Warden and remains by their side.",
			"HOLD: Stow Drone to gain 4% Energy Regen per second.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Drone_Shield",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Warden",
			},
		},
	},
	{
		category: "SKILL",
		name: "Drone: Heal",
		internalSlug: "Skill_DroneHeal_C",
		imageUrl: "items/skills/warden_drone_heal.png",
		id: "966uvg",
		dlc: "DLC3",
		searchableTags: ["Relic Use Speed", "Heal"],
		communityTags: [],
		description: [
			"Deploy Heal Drone with 100 Energy Reserves to follow and protect its Warded Target.",
			"The Warded Target gains 10% increased Relic Use Speed. When the Warded Target is not at Max Health, the Drone consumes 15 Energy to heal 10% of the target's Max Health once every 1s.",
			"When idle for 5s, the Drone goes Dormant, then gains 1% Energy Regen per second. When depleted of Energy the Drone goes inactive, then gains 2% of Energy Regen per second until fully recharged.",
			"SINGLE PRESS: Drone alters its Warded Target to the targeted ally. Max 1 Heal Drone per target.",
			"DOUBLE TAP: Drone returns to the Warden and remains by their side.",
			"HOLD: Stow Drone to gain 4% Energy Regen per second.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Drone_Heal",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Warden",
			},
		},
	},
	{
		category: "SKILL",
		name: "Drone: Combat",
		internalSlug: "Skill_DroneCombat_C",
		imageUrl: "items/skills/warden_drone_combat.png",
		id: "tt4r61",
		dlc: "DLC3",
		searchableTags: ["Fire Rate", "Melee Speed", "Charged Shot"],
		communityTags: [],
		description: [
			"Deploy Combat Drone with 100 Energy Reserves to follow and protect its Warded Target.",
			"The Warded Target gains 10% increased Fire Rate and Melee Speed and 10% faster firearm charge time. While in combat, the Drone attacks the Warded Target's focused enemy, consuming 10 Energy per barrage.",
			"When idle for 5s, the drone goes Dormant, then gains 1% Energy Regen per second. When depleted of Energy the Drone goes Inactive, then gains 2% of Energy Regen per second until fully recharged.",
			"SINGLE PRESS: Drone alters its Warded Target to the targeted ally. Max 1 Combat Drone per target.",
			"DOUBLE TAP: Drone returns to the Warden and remains by their side.",
			"HOLD: Stow Drone to gain 4% Energy Regen per second.",
		],
		wikiUrl: "https://remnant2.wiki.gg/Drone_Combat",
		location: undefined,
		linkedItems: {
			archetype: {
				name: "Warden",
			},
		},
	},
];

export { type Remnant2SkillItem, SKILLS };
