import Image from 'next/image';
import type { BaseItemType } from '@/features/item/types';
import { OptionalItemIndicator } from '@/features/item/components/optional-item-indicator';
import { cn } from '@/lib/shadcn/utils';

// Can either provide a url or a ReactNode
type ImageProps =
  | {
      imageSrc: string;
      imageContent?: undefined;
    }
  | {
      imageSrc?: undefined;
      imageContent: React.ReactNode;
    };

export type ItemCardItemType = BaseItemType;

export type ItemCardProps = {
  item: ItemCardItemType;
} & ImageProps;

const ItemCard = ({ item, imageSrc, imageContent }: ItemCardProps) => {
  return (
    <div className="relative flex h-[150px] w-[125px] max-w-[125px] items-start justify-center gap-0.5">
      {/* {item.optional && (
        <div className="absolute top-3 -left-3">
          <OptionalItemIndicator />
        </div>
      )} */}
      <div
        key={item.slug}
        className="flex h-full w-full flex-col rounded-tl-xl rounded-tr-xl border bg-white text-center dark:bg-black"
      >
        <div className="relative flex h-full max-h-[110px] flex-1 items-center justify-center">
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={item.name}
              className="max-h-full max-w-full object-contain py-2"
              fill
              sizes="h-[110px]"
            />
          )}
          {imageContent}
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
