import type { BaseItemType } from '@/features/item/types';
import type {
  COE33Character,
  COE33ItemCategory,
  COE33ItemTag,
  COE33Stain,
} from '@prisma/client';

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

type COE33SkillItem = COE33SkillItem_Lune | COE33SkillItem_NotLune;

type COE33Item_NotSkill = COE33BaseItemType & {
  category: Exclude<COE33ItemCategory, 'SKILL'>;
  character?: COE33Character;
  gains?: COE33Stain[];
  consumes?: never;
};

type COE33PictoItem = COE33Item_NotSkill;
type COE33WeaponItem = COE33Item_NotSkill;

export type COE33ItemType = COE33SkillItem | COE33PictoItem | COE33WeaponItem;
