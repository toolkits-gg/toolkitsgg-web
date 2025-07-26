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
  size?: 'standard' | 'tall';
} & ImageProps;

const ItemCard = ({
  item,
  imageSrc,
  imageContent,
  size = 'standard',
}: ItemCardProps) => {
  const standardCardClasses = {
    container: 'h-[150px] w-[125px] max-w-[125px]',
    imageContainer: 'h-full max-h-[110px]',
    imageWidth: 90,
    imageHeight: 90,
  };
  const tallCardClasses = {
    container: 'h-[300px] w-[125px] max-w-[125px]',
    imageContainer: 'h-full max-h-[260px]',
    imageWidth: 90,
    imageHeight: 180,
  };

  return (
    <div
      className={cn(
        'relative flex items-start justify-center gap-0.5',

        size === 'standard' && standardCardClasses.container,
        size === 'tall' && tallCardClasses.container
      )}
    >
      {/* {item.optional && (
        <div className="absolute top-3 -left-3">
          <OptionalItemIndicator />
        </div>
      )} */}
      <div
        key={item.slug}
        className="flex h-full w-full flex-col rounded-tl-xl rounded-tr-xl border bg-white text-center dark:bg-black"
      >
        <div
          className={cn(
            'flex flex-1 items-center justify-center p-1',
            size === 'standard' && standardCardClasses.imageContainer,
            size === 'tall' && tallCardClasses.imageContainer
          )}
        >
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={item.name}
              width={
                size === 'standard'
                  ? standardCardClasses.imageWidth
                  : tallCardClasses.imageWidth
              }
              height={
                size === 'standard'
                  ? standardCardClasses.imageHeight
                  : tallCardClasses.imageHeight
              }
              className="max-h-full max-w-full"
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
