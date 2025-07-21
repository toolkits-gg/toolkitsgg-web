import type { BaseItemType } from '@/features/item/types';
import type {
  COE33Character,
  COE33ItemCategory,
  COE33ItemTag,
  COE33Stain,
} from '@prisma/client';

export type COE33BaseItemType = BaseItemType<COE33ItemCategory, COE33ItemTag>;

export type COE33LuneSkillItem = COE33BaseItemType & {
  category: 'SKILL';
  character: 'LUNE';
  stainGain: COE33Stain[];
  stainConsume: COE33Stain[];
};

export type COE33NonLuneSkillItem = COE33BaseItemType & {
  category: 'SKILL';
  character: Exclude<COE33Character, 'LUNE'>;
  stainGain?: never;
  stainConsume?: never;
};

export type COE33NonSkillItem = COE33BaseItemType & {
  category: Exclude<COE33ItemCategory, 'SKILL'>;
  character?: never;
  gains?: COE33Stain[];
  consumes?: never;
};

export type COE33ItemType =
  | COE33LuneSkillItem
  | COE33NonLuneSkillItem
  | COE33NonSkillItem;
