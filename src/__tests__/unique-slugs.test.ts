import { allGameConfigs } from '@/features/game/constants';

for (const config of allGameConfigs) {
  if (config.id === 'none') {
    continue;
  }

  if (!config.items || !config.items.length) {
    console.warn(`No items found for game config: ${config.id}`);
    continue;
  }

  test(`testing unique item slugs for: ${config.id}`, () => {
    const uniqueItems = new Set(config.items.map((item) => item?.slug));
    expect(uniqueItems.size).toBe(config.items.length);
  });
}
