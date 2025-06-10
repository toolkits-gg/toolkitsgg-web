import { writeFileSync } from 'fs';
import path from 'path';
import type { COE33ItemType } from '@/features/game/games/coe33/items';
import PictoIconsData from './DT_PictoIcons.json';
import GameData from './Game.json';

const TARGET_KEY = 'ST_PassiveEffects';
const pictoBaseData = GameData[TARGET_KEY] as Record<string, string>;
const pictoTextureData = PictoIconsData[0]['Rows'] as Record<string, any>;

if (!pictoBaseData) {
  throw new Error(`Data for key ${TARGET_KEY} not found in GameData.`);
}

const internalSlugs = [
  'AcceleratorHeal',
  'APOnBurn',
  'APOnPowerful',
  'APOnRush',
  'APOnShell',
  'AutoDispelEnergy',
  'BaseShield',
  'BeneficialContamination',
  'BigEnergyTint',
  'BigHealingTint',
  'BreakDamageOnBurn',
  'BreakDamageOnCrit',
  'BreakDamageOnSlow',
  'Breaker',
  'BreakingCounter',
  'BreakingDeath',
  'BreakingStrong',
  'BreakMomentum',
  'BreakShot',
  'BreakSpecialist',
  'BurnDurationIncrease',
  'BurningBreak',
  'BurningDeath',
  'BurningMark',
  'CharybdeToScylla',
  'Cheater',
  'CleansingTint',
  'ConfidentFighter',
  'CritChanceOnBurn',
  'CritChanceOnDefenseless',
  'CritChanceOnStunned',
  'CritChanceOnWeak',
  'CriticalBreak',
  'CriticalCursedPower',
  'CriticalHavoc',
  'CriticalMoment',
  'CursedPower',
  'DeadEnergy',
  'DefenselessOnBreak',
  'DefensiveMode',
  'DefenslessStrike',
  'DispelOnAPConsume',
  'DoubleBurn',
  'DoubleMark',
  'EffectiveHeal',
  'EffectivSupport',
  'EnergizingHeal',
  'Energy',
  'EnergyBreak',
  'EvasiveHealer',
  'FasterThanStrong',
  'firstOffensive',
  'FreeAimBurnShot',
  'FreeAimEnergy',
  'FreeAimInvertedShot',
  'FreeAimMarkingShot',
  'FreeAimPowerful',
  'FreeAimPrecision',
  'FreeAimShell',
  'FreeAimSpeed',
  'FromBehind',
  'FullEnergyAttack',
  'GlassCanon',
  'GradientBreak',
  'GradientBreaker',
  'GradientCounterCharge',
  'GradientCure',
  'GradientEnergy',
  'GradientFighter',
  'GradientHeal',
  'GradientMark',
  'GradientStacker',
  'GradientTint',
  'GradientWeakness',
  'GreaterDefenseless',
  'GreaterPowerful',
  'GreaterPowerless',
  'GreaterPrecision',
  'GreaterShell',
  'GreaterSlow',
  'GreaterSpeed',
  'GreatFireBreak',
  'GreatHealingTint',
  'HealingCounter',
  'HealingFire',
  'HealingMark',
  'HealingShare',
  'HealingStun',
  'HealingTintEnergy',
  'HealOnBuff',
  'IDontNeedShield',
  'Immaculate',
  'InMediasRes',
  'JumpRecovery',
  'LastStandCritical',
  'LastStandPowerful',
  'LastStandShell',
  'LastStandSpeed',
  'LongerPowerful',
  'LongerRush',
  'LongerShell',
  'MarkOnBreak',
  'Painter',
  'ParryHelper',
  'PatientFighter',
  'perfectHeal',
  'PerfectReward',
  'PhysicalFighter',
  'PierceDefense',
  'PostGradient',
  'PowerDodgeCombo',
  'PowerfulHeal',
  'PowerfulMark',
  'PowerfulOnShell',
  'PowerfulShield',
  'PowerfulStrike',
  'PowerfulTint',
  'PowerlessStrike',
  'PowerOfPain',
  'ProBlocker',
  'ProRetreat',
  'ProtectingFire',
  'ProtectingHeal',
  'ProtectionSpirit',
  'RandomDefense',
  'reinforcementParade',
  'ReviveParadox',
  'ReviveTintEnergy',
  'RewardingMark',
  'Roulette',
  'RushOnPowerful',
  'SharedCare',
  'ShellOnRush',
  'ShellStrike',
  'ShellTint',
  'ShieldBreaker',
  'ShieldingTint',
  'Shortcut',
  'SimpleBreaker',
  'SlowOnBreak',
  'Sniper',
  'SoulEater',
  'SpeedTint',
  'StayMarked',
  'StunBoost',
  'StunEnergy',
  'Tainted',
  'TimeTint',
  'Versatile',
  'VersatileHealer',
  'Warming',
  'WeakeningMark',
  'WeaknessGain',
];

function getAssetPathForSlug(internalSlug: string): string {
  // Check if the internal slug exists as a key in the Rows object
  if (pictoTextureData[internalSlug]) {
    // There are now three keys to check. I need the key that starts with `PictoIcon_`
    // that key will then have the AssetPathName key
    const assetKey = Object.keys(pictoTextureData[internalSlug]).find((key) =>
      key.startsWith('PictoIcon_')
    );
    if (assetKey && pictoTextureData[internalSlug][assetKey]) {
      return (
        pictoTextureData[internalSlug][assetKey]['AssetPathName'].split(
          '.'
        )[1] || ''
      );
    }
  }

  return ''; // Return empty string if not found
}

const pictoItems: COE33ItemType[] = [];
for (const internalSlug of internalSlugs) {
  const nameKey = `PASSIVE_${internalSlug}_Name`;
  const descriptionKey = `PASSIVE_${internalSlug}_Description`;

  if (!pictoBaseData[nameKey]) {
    console.warn(`Name for ${internalSlug} not found.`);
    continue;
  }

  if (!pictoBaseData[descriptionKey]) {
    console.warn(`Description for ${internalSlug} not found.`);
    continue;
  }

  const name = pictoBaseData[nameKey];
  const description = pictoBaseData[descriptionKey];

  // slug should be a unique randomized 4-letter string
  let slug = Math.random().toString(36).substring(2, 6);
  let slugExists = pictoItems.some((item) => item.slug === slug);
  while (slugExists) {
    slug = Math.random().toString(36).substring(2, 6);
    slugExists = pictoItems.some((item) => item.slug === slug);
  }

  // TODO Parse asset name

  pictoItems.push({
    name,
    description,
    internalSlug,
    slug,
    imageUrl: `pictos/${getAssetPathForSlug(internalSlug)}.webp`,
    category: 'PICTO',
    tags: [],
  });
}

// sort the items by name
pictoItems.sort((a, b) => a.name.localeCompare(b.name));

const outputFilePath = path.join(__dirname, 'output.json');

writeFileSync(outputFilePath, JSON.stringify(pictoItems, null, 2), 'utf-8');
console.log(`Picto items extracted and saved to ${outputFilePath}`);
