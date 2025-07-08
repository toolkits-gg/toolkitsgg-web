export type BaseItemType<ItemCategory = string, ItemTag = string> = {
  name: string;
  description: string;
  internalSlug: string;
  slug: string;
  imageUrl: string;
  category: ItemCategory;
  tags: ItemTag[];
};
