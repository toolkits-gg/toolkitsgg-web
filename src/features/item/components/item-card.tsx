import Image from 'next/image';
import type { BaseItemType } from '@/features/item/types';
import { OptionalItemIndicator } from '@/features/item/components/optional-item-indicator';

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

// TODO: This should be defined with the build logic when implemented
type BuildItemType = {
  optional?: boolean;
};

export type ItemCardItemType = BaseItemType & BuildItemType;

export type ItemCardProps = {
  item: ItemCardItemType;
} & ImageProps;

const ItemCard = ({ item, imageSrc, imageContent }: ItemCardProps) => {
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
        <div className="flex h-full max-h-[110px] w-full flex-1 items-center justify-center p-1">
          {imageSrc && (
            <Image src={imageSrc} alt={item.name} width={90} height={90} />
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
