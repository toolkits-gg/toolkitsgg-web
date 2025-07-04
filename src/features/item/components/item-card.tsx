import type { GameId } from '@prisma/client';
import Image from 'next/image';
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
    <div className="flex h-[150px] w-[125px] max-w-[125px] items-start justify-center gap-0.5">
      <div
        key={item.slug}
        className="flex h-full w-full flex-col rounded-tl-xl rounded-tr-xl border bg-white text-center dark:bg-black"
      >
        <div className="flex h-[102px] w-full flex-1 items-center justify-center p-1">
          <Image
            src={getImageUrl(item.imageUrl, gameId)}
            alt={item.name}
            width={90}
            height={90}
          />
        </div>
        <div className="bg-primary/75 text-primary-foreground flex h-10 w-full flex-col items-center justify-center">
          <span className="text-xs font-medium break-words whitespace-pre-wrap">
            {item.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export { ItemCard };
