import { writeFileSync } from 'fs';
import path from 'path';
import { coe33Characters } from '@/features/game/games/coe33/constants';
import {
  coe33Items,
  type COE33ItemType,
} from '@/features/game/games/coe33/items';
import SkillData from '../inputs/DT_SkillIcons.json';
import GameData from '../inputs/Game.json';

const parseSkillData = (): COE33ItemType[] => {
  const excludedInternalSlugs = [
    'Assault',
    'WeAreMe',
    'FencesFlourish',
    'PainterSwitch',
    'GuardiansGift',
    'Cure',
    'RiggedDistribution',
    'ForetellingSouls',
    'SharedBlessing',
    'Goblu',
    'ShieldPunch',
    'BourgeonHeadCrush',
    'CultistDualCombo',
    'StalactKaboom',
  ];

  const data = SkillData[0]['Rows'] as Record<string, any>;

  const skillItems: COE33ItemType[] = [];

  for (const key in data) {
    if (excludedInternalSlugs.includes(key)) {
      console.warn(`Skipping excluded skill: ${key}`);
      continue;
    }

    const internalSlug = key;

    const assetKey = Object.keys(data[internalSlug]).find((key) =>
      key.startsWith('SkillIcon_')
    );

    if (assetKey && data[internalSlug][assetKey]) {
      const assetPath = data[internalSlug][assetKey];

      const character =
        assetPath['AssetPathName'].split('.')[0].split('_')[3].toUpperCase() ||
        '';

      if (!character || coe33Characters.indexOf(character) === -1) {
        console.warn(
          `Unknown character: ${character} for skill: ${internalSlug}`
        );
        continue;
      }

      const imageName = assetPath['AssetPathName'].split('.')[1] || '';
      const imageUrl = `skills/${imageName}.webp`;

      const skillItem: COE33ItemType = {
        name: '',
        description: '',
        internalSlug,
        slug: '', // Placeholder, will be updated later
        imageUrl,
        category: 'SKILL',
        tags: [],
        character,
      };
      skillItems.push(skillItem);
    }
  }
  return skillItems;
};

const parseGameData = (skillItems: COE33ItemType[]): COE33ItemType[] => {
  // Maps the DT_SkillIcons internal slugs to the Game.json data
  const incorrectInternalSlugs: { [key: string]: string } = {
    GustavesMemoire: 'GustaveSMemoire',
    FollowUp: 'Followup',
    RockSlide: 'EarthSpike',
    TerraQuake: 'Terraquake',
    Foretelling2: 'FocusedForetell',
    FortunesFury: 'FortuneSFury',
    HammerSmash: 'BraseleurHammerSmash',
    ChevaliereCAOECombo: 'ChevaliereFrozenCombo',
    ChevaliereCAC: 'ChevaliereCaC',
    HeavyCultistBloodSword: 'CultistBloodSword',
    FlyingSlashes: 'CultistFlyingSlashes',
    StormBlood: 'DuallistStormBlood',
    GlaiseEarthquakes: 'GlaiseEarthquake',
    OrphelinBuff: 'OrphelinPowerful',
    PortierCrashingDown: 'PortierSmash',
    ThunderEstoc: 'PotatobagRangerThunderEstoc',
    ThunderThrows: 'PotatobagMageThunderThrows',
    PotatobagSlam: 'PotatobagTankSlam',
    Trumpet: 'TroubadourBuff',
  };

  const incorrectNames: { [key: string]: string } = {
    Combo1: `Assault Zero`,
  };

  const data = GameData['ST_MainCharacters_Skills'] as Record<string, string>;

  // * Exemptions for some items that have different internal slugs between files

  const results: COE33ItemType[] = [];

  for (const item of skillItems) {
    const internalSlug =
      incorrectInternalSlugs[item.internalSlug] || item.internalSlug;

    const nameKeySearch = `_${internalSlug}_Name`;
    const nameKey = Object.keys(data).find(
      (key) => key.indexOf(nameKeySearch) !== -1
    );
    const descriptionKey = Object.keys(data).find(
      (key) => key.indexOf(`_${internalSlug}_Description_Long`) !== -1
    );

    if (!nameKey) {
      console.warn(`Name for ${internalSlug} not found.`);
      results.push({
        ...item,
        name: '',
        description: '',
      });
      continue;
    }

    if (!descriptionKey) {
      console.warn(`Description for ${internalSlug} not found.`);
      results.push({
        ...item,
        name: '',
        description: '',
      });
      continue;
    }

    results.push({
      ...item,
      name: incorrectNames[internalSlug] || data[nameKey],
      description: data[descriptionKey],
    });
  }

  return results;
};

const generateSlugs = (skillItems: COE33ItemType[]): COE33ItemType[] => {
  const results = skillItems.map((item) => {
    const existingItem = coe33Items.find(
      (existing) => existing.internalSlug === item.internalSlug
    );

    return {
      ...item,
      slug: existingItem ? existingItem.slug : generateSlug(skillItems),
    };
  });

  return results;
};

const generateSlug = (skillItems: COE33ItemType[]): string => {
  // slug should be a unique randomized 4-letter string
  let slug = Math.random().toString(36).substring(2, 6);
  let slugExists =
    coe33Items.some((item) => item.slug === slug) ||
    skillItems.some((item) => item.slug === slug);
  while (slugExists) {
    slug = Math.random().toString(36).substring(2, 6);
    slugExists =
      coe33Items.some((item) => item.slug === slug) ||
      skillItems.some((item) => item.slug === slug);
  }
  return slug;
};

const main = () => {
  let skillItems = parseSkillData();
  skillItems = parseGameData(skillItems);
  skillItems = generateSlugs(skillItems);

  skillItems.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const outputFilePath = path.join(__dirname, 'output.json');
  writeFileSync(outputFilePath, JSON.stringify(skillItems, null, 2), 'utf-8');

  console.log(`Skill items extracted and saved to ${outputFilePath}`);
};

main();
