import Image from 'next/image';
import type { BaseItemType } from '@/features/item/types';
import { OptionalItemIndicator } from '@/features/item/components/optional-item-indicator';

type ItemCardProps<ItemType> = {
  item: ItemType;
  src: string;
};

const ItemCard = <ItemType extends BaseItemType & { optional?: boolean }>({
  item,
  src,
}: ItemCardProps<ItemType>) => {
  return (
    <div className="relative flex h-[150px] w-[125px] max-w-[125px] items-start justify-center gap-0.5">
      {item.optional && (
        <div className="absolute top-3 -left-3">
          <OptionalItemIndicator />
        </div>
      )}
      <div
        key={item.slug}
        className="flex h-full w-full flex-col rounded-tl-xl rounded-tr-xl border bg-white text-center dark:bg-black"
      >
        <div className="flex h-full w-full flex-1 items-center justify-center p-1">
          <Image src={src} alt={item.name} width={90} height={90} />
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
