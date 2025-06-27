import type { GameId } from '@prisma/client';
import Image from 'next/image';
import { Text } from '@/components/text';
import type { BaseItemType } from '@/features/item/types';
import { getImageUrl } from '@/utils/url';

type ItemCardProps<ItemType> = {
  item: ItemType;
  gameId: GameId;
  actions: React.ReactNode;
};

const ItemCard = <ItemType extends BaseItemType>({
  item,
  gameId,
  actions,
}: ItemCardProps<ItemType>) => {
  return (
    <div className="flex items-start justify-center gap-0.5">
      <div
        key={item.slug}
        className="flex h-[125px] w-[125px] max-w-[125px] flex-col rounded-tl-xl rounded-tr-xl border bg-white text-center dark:bg-black"
      >
        <div className="flex h-[85px] w-full flex-1 items-center justify-center p-1">
          <Image
            src={getImageUrl(item.imageUrl, gameId)}
            alt={item.name}
            width={75}
            height={75}
          />
        </div>
        <div className="bg-primary/75 text-primary-foreground flex h-full w-full flex-col items-center justify-center p-0.5">
          <Text className="text-xs font-medium break-words whitespace-pre-wrap">
            {item.name}
          </Text>
        </div>
      </div>
      {actions && (
        <div className="flex h-[125px] w-9 min-w-9 items-start justify-center rounded-tl-xl rounded-tr-xl border bg-white dark:bg-black">
          {actions}
        </div>
      )}
    </div>
  );
};

export { ItemCard };
