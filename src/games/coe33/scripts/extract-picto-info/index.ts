import { writeFileSync } from 'fs';
import path from 'path';
import { pictoInternalSlugs } from '@/games/coe33/scripts/extract-picto-info/picto-internal-slugs';
import PictoIconsData from '../inputs/DT_PictoIcons.json';
import GameData from '../inputs/Game.json';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { coe33Items } from '@/games/coe33/items/all-items';

const parseGameData = (internalSlug: string) => {
  const targetKey = 'ST_PassiveEffects';
  const data = GameData[targetKey] as Record<string, string>;

  // * Need an exemptions for some items that differ
  // * between the PictoIcons.json and Game.json files.
  if (internalSlug === 'AugmentedCounterB') {
    return {
      name: 'Augmented Counter II',
      description: '50% increased Counterattack damage.',
    };
  }

  const nameKey = `PASSIVE_${internalSlug}_Name`;
  const descriptionKey = `PASSIVE_${internalSlug}_Description`;

  if (!data[nameKey]) {
    console.warn(`Name for ${internalSlug} not found.`);
    return {
      name: '',
      description: '',
    };
  }

  if (!data[descriptionKey]) {
    console.warn(`Description for ${internalSlug} not found.`);
    return {
      name: '',
      description: '',
    };
  }

  return {
    name: data[nameKey],
    description: data[descriptionKey],
  };
};

const getAssetPathForSlug = (internalSlug: string): string => {
  const data = PictoIconsData[0]['Rows'] as Record<string, any>;

  // * Need an exemptions for some items that differ
  // * between the PictoIcons.json and Game.json files.
  if (internalSlug === 'CritChanceOnBurn') {
    internalSlug = 'CritChanceBurn';
  }
  if (internalSlug === 'AntiStunned') {
    internalSlug = 'AntiStun';
  }
  if (internalSlug === 'AugmentedCounter') {
    internalSlug = 'CounterUpdragdeA';
  }
  if (internalSlug === 'AugmentedCounterB') {
    internalSlug = 'CounterUpdragdeB';
  }
  if (internalSlug === 'AugmentedCounterC') {
    internalSlug = 'CounterUpdragdeC';
  }
  if (internalSlug === 'DeathBomb') {
    internalSlug = 'DeathBombPhysical';
  }
  if (internalSlug === 'InitialApA') {
    internalSlug = 'InitialAp+1A';
  }
  if (internalSlug === 'InitialApB') {
    internalSlug = 'InitialAp+1B';
  }
  if (internalSlug === 'InitialApC') {
    internalSlug = 'InitialAp+1C';
  }
  if (internalSlug === 'InitialApD') {
    internalSlug = 'InitialAp+1D';
  }

  // Check if the internal slug exists as a key in the Rows object
  if (data[internalSlug]) {
    // There are now three keys to check. I need the key that starts with `PictoIcon_`
    // that key will then have the AssetPathName key
    const assetKey = Object.keys(data[internalSlug]).find((key) =>
      key.startsWith('PictoIcon_')
    );

    if (assetKey && data[internalSlug][assetKey]) {
      return data[internalSlug][assetKey]['AssetPathName'].split('.')[1] || '';
    }
  }

  return ''; // Return empty string if not found
};

const generateSlug = (pictoItems: COE33ItemType[]): string => {
  // slug should be a unique randomized 4-letter string
  let slug = Math.random().toString(36).substring(2, 6);
  let slugExists = pictoItems.some((item) => item.slug === slug);
  while (slugExists) {
    slug = Math.random().toString(36).substring(2, 6);
    slugExists = pictoItems.some((item) => item.slug === slug);
  }
  return slug;
};

const main = () => {
  const pictoItems: COE33ItemType[] = [];

  for (const internalSlug of pictoInternalSlugs) {
    const { name, description } = parseGameData(internalSlug);

    const existingItem = coe33Items.find(
      (item) => item.internalSlug === internalSlug
    );

    const slug = existingItem ? existingItem.slug : generateSlug(pictoItems);

    const assetPath = getAssetPathForSlug(internalSlug);
    const imageUrl = `pictos/${assetPath}.webp`;

    pictoItems.push({
      name,
      description,
      internalSlug,
      slug,
      imageUrl,
      category: 'PICTO',
      tags: [],
    });
  }

  pictoItems.sort((a, b) => a.name.localeCompare(b.name));

  const outputFilePath = path.join(__dirname, 'output.json');
  writeFileSync(outputFilePath, JSON.stringify(pictoItems, null, 2), 'utf-8');

  console.log(`Picto items extracted and saved to ${outputFilePath}`);
};

main();
