import { writeFileSync } from 'fs';
import path from 'path';
import { generateSlugs } from '@/games/coe33/scripts/utils';
import WeaponData from '../inputs/DT_WeaponIcons.json';
import GameData from '../inputs/Game.json';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { coe33Characters } from '@/games/coe33/constants';

const parseWeaponData = (): COE33ItemType[] => {
  const excludedInternalSlugs: string[] = [];

  const data = WeaponData[0]['Rows'] as Record<string, any>;

  const weaponItems: COE33ItemType[] = [];

  for (const key in data) {
    if (excludedInternalSlugs.includes(key)) {
      console.warn(`Skipping excluded weapon: ${key}`);
      continue;
    }

    const internalSlug = key;

    const assetKey = Object.keys(data[internalSlug]).find((key) =>
      key.startsWith('WeaponIcon_')
    );

    if (assetKey && data[internalSlug][assetKey]) {
      const assetPath = data[internalSlug][assetKey];

      const imageName = assetPath['AssetPathName'].split('.')[1] || '';
      const imageUrl = `weapons/${imageName}.webp`;

      const character =
        assetPath['AssetPathName'].split('.')[0].split('_')[2].toUpperCase() ||
        '';

      if (!character || coe33Characters.indexOf(character) === -1) {
        console.warn(
          `Unknown character: ${character} for weapon: ${internalSlug}, ${assetPath['AssetPathName']}`
        );
        continue;
      }

      const weaponItem: COE33ItemType = {
        name: '',
        description: '',
        internalSlug,
        slug: '', // Placeholder, will be updated later
        imageUrl,
        category: 'WEAPON',
        tags: [],
        character,
      };
      weaponItems.push(weaponItem);
    }
  }
  return weaponItems;
};

const parseGameData = (weaponItems: COE33ItemType[]): COE33ItemType[] => {
  // Maps the DT_WeaponIcons internal slugs to the Game.json data
  // in the cases where they don't match
  const incorrectInternalSlugs: { [key: string]: string } = {};

  // Maps the DT_WeaponIcons names to the Game.json data
  // in the cases where they don't match
  const incorrectNames: { [key: string]: string } = {};

  const data = GameData['ST_Items'] as Record<string, string>;

  const results: COE33ItemType[] = [];

  for (const item of weaponItems) {
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
        description: descriptionKey ? data[descriptionKey] : '',
      });
      continue;
    }

    if (!descriptionKey) {
      console.warn(`Description for ${internalSlug} not found.`);
      results.push({
        ...item,
        name: incorrectNames[internalSlug] || data[nameKey],
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

const main = () => {
  let weaponItems = parseWeaponData();
  weaponItems = parseGameData(weaponItems);
  weaponItems = generateSlugs(weaponItems);

  weaponItems.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const outputFilePath = path.join(__dirname, 'output.json');
  writeFileSync(outputFilePath, JSON.stringify(weaponItems, null, 2), 'utf-8');

  console.log(`Weapon items extracted and saved to ${outputFilePath}`);
};

main();
