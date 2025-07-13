import {
  ItemCard,
  type ItemCardProps,
} from '@/features/item/components/item-card';
import { cn } from '@/lib/shadcn/utils';
import Image from 'next/image';

type TrackableItemCardProps = {
  item: ItemCardProps['item'] & {
    collected: boolean;
  };
  imageSrc: string;
};

const TrackableItemCard = ({ item, imageSrc }: TrackableItemCardProps) => {
  // TODO: Make a button that tracks/untracks
  const imageContent = (
    <Image src={imageSrc} alt={item.name} width={90} height={90} />
  );

  return (
    <div className={cn(!item.collected && 'grayscale-100')}>
      <ItemCard item={item} imageContent={imageContent} />
    </div>
  );
};

export { TrackableItemCard };
