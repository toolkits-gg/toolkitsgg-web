'use client';

import { Card, Image, Stack, Text } from '@mantine/core';
import NextImage from 'next/image';
import type { BaseItemType } from '@/features/item/types';
import classes from './WideItemCard.module.css';

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

const ItemDescription = ({
  itemDescription,
}: {
  itemDescription: ItemCardItemType['description'];
}) => {
  if (typeof itemDescription === 'string') {
    return (
      <Text mt="sm" mb="md" fz="sm">
        {itemDescription}
      </Text>
    );
  }

  return itemDescription
    .filter((desc) => desc !== '')
    .map((desc) => (
      <Text mt="sm" mb="md" fz="sm" key={desc}>
        {desc}
      </Text>
    ));
};

export type ItemCardProps = {
  item: ItemCardItemType;
} & ImageProps;

const WideItemCard = ({ item, imageSrc, imageContent }: ItemCardProps) => {
  return (
    <Card withBorder radius="md" w="400px" h="175px" className={classes.card}>
      <Card.Section
        className={classes.imageContainer}
        w="175px"
        miw="175px"
        h="175px"
      >
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={`Image of ${item.name}`}
            width={175}
            height={175}
            component={NextImage}
            className={classes.image}
          />
        )}
        {imageContent}
      </Card.Section>
      <Stack
        h="100%"
        w="100%"
        display="flex"
        justify="flex-start"
        align="flex-start"
        px="xs"
        py="sm"
        gap={4}
      >
        <Text fz="h2" fw="bolder" lineClamp={2} className={classes.itemName}>
          {item.name}
        </Text>
        <Text fz="xs" fw="bold" tt="uppercase" className={classes.itemCategory}>
          {item.category}
        </Text>
        <ItemDescription itemDescription={item.description} />
      </Stack>
    </Card>
  );
};

export { WideItemCard };
