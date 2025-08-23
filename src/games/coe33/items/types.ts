import type {
  COE33Character,
  COE33Element,
  COE33ItemCategory,
  COE33ItemTag,
  COE33Stain,
  COE33WeaponGrade,
} from '@prisma/client';
import type { BaseItemType } from '@/features/item/types';

export type COE33BaseItemType = BaseItemType<COE33ItemCategory, COE33ItemTag>;

type COE33SkillItem_Lune = COE33BaseItemType & {
  category: 'SKILL';
  character: 'LUNE';
  stainGain: COE33Stain[];
  stainConsume: COE33Stain[];
};

type COE33SkillItem_NotLune = COE33BaseItemType & {
  category: 'SKILL';
  character: Exclude<COE33Character, 'LUNE'>;
  stainGain?: never;
  stainConsume?: never;
};

export type COE33SkillItem = COE33SkillItem_Lune | COE33SkillItem_NotLune;

type COE33Item_NotSkill = COE33BaseItemType & {
  category: Exclude<COE33ItemCategory, 'SKILL'>;
  character?: COE33Character;
  gains?: COE33Stain[];
  consumes?: never;
};

export type COE33PictoItem = COE33Item_NotSkill;

export type COE33WeaponItem = COE33Item_NotSkill & {
  element: COE33Element | undefined;
  power: number;
  agility: COE33WeaponGrade | undefined;
  defense: COE33WeaponGrade | undefined;
  luck: COE33WeaponGrade | undefined;
  might: COE33WeaponGrade | undefined;
  vitality: COE33WeaponGrade | undefined;
};

export type COE33ItemType = COE33SkillItem | COE33PictoItem | COE33WeaponItem;
