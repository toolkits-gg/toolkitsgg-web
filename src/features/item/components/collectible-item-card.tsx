'use client';

import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { toggleCollectedItem } from '@/features/collection/actions/toggle-collected-item';
import {
  ItemCard,
  type ItemCardProps,
} from '@/features/item/components/item-card';
import { cn } from '@/lib/shadcn/utils';
import type { GameId } from '@prisma/client';
import Image from 'next/image';
import { useActionState } from 'react';

type CollectibleItemCardProps = {
  gameId: GameId;
  item: ItemCardProps['item'] & {
    collected: boolean;
  };
  imageSrc: string;
};

const CollectibleItemCard = ({
  gameId,
  item,
  imageSrc,
}: CollectibleItemCardProps) => {
  const [actionState, action, isPending] = useActionState(
    toggleCollectedItem.bind(null, gameId, item.slug),
    EMPTY_ACTION_STATE
  );

  const imageContent = (
    <Form action={action} actionState={actionState}>
      <SubmitButton
        plain
        isPending={isPending}
        tooltipContent={`Toggle ${item.name} collected status`}
        aria-label={`Toggle ${item.name} collected status`}
      >
        <Image src={imageSrc} alt={item.name} width={90} height={90} />
      </SubmitButton>
    </Form>
  );

  return (
    <div className={cn(!item.collected && 'grayscale-100')}>
      <ItemCard item={item} imageContent={imageContent} />
    </div>
  );
};

export { CollectibleItemCard };
