import { writeFileSync } from 'fs';
import path from 'path';
import { coe33Characters } from '@/games/coe33/constants';
import type { COE33WeaponItem } from '@/games/coe33/items/types';
import { generateSlugs } from '@/games/coe33/scripts/utils';
import WeaponData from '../inputs/DT_WeaponIcons.json';
import GameData from '../inputs/Game.json';

const parseWeaponData = (): COE33WeaponItem[] => {
  const excludedInternalSlugs: string[] = [
    'GDC_Weapon_Sciel',
    'GDC_Weapon_Maelle',
    'GDC_Weapon_Lune',
    'GDC_Weapon_Verso',
    'GDC_Weapon_Monoco',
    '03_Weapon_Placeholder',
    'MitigatedPerfection',
    'DebugSciel',
    'DebugLune',
    'DebugVerso',
    'DebugMaelle',
    'DebugMonoco',
  ];

  const data = WeaponData[0]['Rows'] as Record<string, any>;

  const weaponItems: COE33WeaponItem[] = [];

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

      const weaponItem: COE33WeaponItem = {
        name: '',
        description: [''],
        internalSlug,
        slug: '', // Placeholder, will be updated later
        imageUrl,
        category: 'WEAPON',
        tags: [],
        character,
        element: undefined,
        power: -1,
        agility: undefined,
        defense: undefined,
        luck: undefined,
        might: undefined,
        vitality: undefined,
      };
      weaponItems.push(weaponItem);
    }
  }
  return weaponItems;
};

const parseGameData = (weaponItems: COE33WeaponItem[]): COE33WeaponItem[] => {
  // Maps the DT_WeaponIcons internal slugs to the Game.json data
  // in the cases where they don't match
  const incorrectInternalSlugs: { [key: string]: string } = {};

  // Maps the DT_WeaponIcons names to the Game.json data
  // in the cases where they don't match
  const incorrectNames: { [key: string]: string } = {};

  const data = GameData['ST_Items'] as Record<string, string>;

  const results: COE33WeaponItem[] = [];

  for (const item of weaponItems) {
    const internalSlug =
      incorrectInternalSlugs[item.internalSlug] || item.internalSlug;

    const nameKeySearch = `_${internalSlug}_Name`;
    const nameKey = Object.keys(data).find(
      (key) => key.indexOf(nameKeySearch) !== -1
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
    results.push({
      ...item,
      name: incorrectNames[internalSlug] || data[nameKey],
      description: [''],
    });
  }

  return results;
};

const main = () => {
  let weaponItems = parseWeaponData();
  weaponItems = parseGameData(weaponItems);
  weaponItems = generateSlugs<COE33WeaponItem>(weaponItems);

  weaponItems.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const outputFilePath = path.join(__dirname, 'output.json');
  const replacer = (key: string, value: any) =>
    value === undefined ? null : value;

  writeFileSync(
    outputFilePath,
    JSON.stringify(weaponItems, replacer, 2),
    'utf-8'
  );

  console.log(`Weapon items extracted and saved to ${outputFilePath}`);
};

main();
