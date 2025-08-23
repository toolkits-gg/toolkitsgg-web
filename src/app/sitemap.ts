import { type MetadataRoute } from 'next';
import { allGameConfigs } from '@/features/game/constants';

const baseUrl = 'https://toolkits.gg';
const currentDate = new Date().toISOString().split('T')[0];

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

const staticRoutes = [
  { url: baseUrl, lastModified: currentDate, changeFrequency: 'weekly' },
] as const satisfies MetadataRoute.Sitemap;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const gameRoutes: MetadataRoute.Sitemap = [];

  for (const gameConfig of allGameConfigs) {
    const { pages } = gameConfig;
    if (!pages) {
      continue;
    }
    Object.keys(pages).forEach((key) => {
      const page = pages[key as keyof typeof pages];
      if (page?.path) {
        gameRoutes.push({
          url: `${baseUrl}${page.path}`,
          lastModified: currentDate,
          changeFrequency: 'daily' as ChangeFrequency,
        });
      }
    });
  }

  return [...staticRoutes, ...gameRoutes];
}
