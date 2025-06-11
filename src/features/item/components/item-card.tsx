import type { GameId } from '@prisma/client';
import Image from 'next/image';
import { Typography } from '@/components/typography';
import type { BaseItemType } from '@/features/item/types';
import { getImageUrl } from '@/utils/url';

type ItemCardProps<ItemType> = {
  item: ItemType;
  gameId: GameId;
};

const ItemCard = <ItemType extends BaseItemType>({
  item,
  gameId,
}: ItemCardProps<ItemType>) => {
  return (
    <div
      key={item.slug}
      className="border-primary/85 flex h-[125px] w-full max-w-[125px] flex-col rounded-tl-xl rounded-tr-xl border bg-white text-center dark:bg-black"
    >
      <div className="flex h-[85px] w-full flex-1 items-center justify-center p-1">
        <Image
          src={getImageUrl(item.imageUrl, gameId)}
          alt={item.name}
          width={75}
          height={75}
        />
      </div>
      <div className="bg-primary/85 text-primary-foreground flex h-full w-full flex-col items-center justify-center p-0.5">
        <Typography variant="body" className="text-xs font-medium">
          {item.name}
        </Typography>
      </div>
    </div>
  );
};

export { ItemCard };
