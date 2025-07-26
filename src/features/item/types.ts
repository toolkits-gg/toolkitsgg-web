export type BaseItemType<ItemCategory = string, ItemTag = string> = {
  name: string;
  description: string | string[];
  internalSlug: string;
  slug: string;
  imageUrl: string;
  category: ItemCategory;
  tags: ItemTag[];
};
