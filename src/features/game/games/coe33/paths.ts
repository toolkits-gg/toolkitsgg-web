import { getImageUrl } from '@/utils/url';

export const imagePath = (imagePath: string) =>
  getImageUrl(`games/coe33/${imagePath}`);
