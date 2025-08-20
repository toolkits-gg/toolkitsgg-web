'use client';

import { Card, Image, Stack, Text } from '@mantine/core';
import NextImage from 'next/image';
import type { BaseItemType } from '@/features/item/types';
import classes from './CompactItemCard.module.css';

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
      <Text mt="xs" mb="sm" fz="xs">
        {itemDescription}
      </Text>
    );
  }

  return itemDescription
    .filter((desc) => desc !== '')
    .map((desc) => (
      <Text mt="xs" mb="sm" fz="xs" key={desc}>
        {desc}
      </Text>
    ));
};

export type ItemCardProps = {
  item: ItemCardItemType;
} & ImageProps;

const CompactItemCard = ({ item, imageSrc, imageContent }: ItemCardProps) => {
  return (
    <Card withBorder radius="md" w="180px" h="auto" className={classes.card}>
      <Card.Section className={classes.imageContainer}>
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={`Image of ${item.name}`}
            width={120}
            height={120}
            component={NextImage}
            className={classes.image}
          />
        )}
        {imageContent}
      </Card.Section>
      <Stack
        w="100%"
        display="flex"
        justify="flex-start"
        align="flex-start"
        px="xs"
        py="sm"
        gap={4}
      >
        <Text
          fz="md"
          fw="bolder"
          ta="left"
          lineClamp={2}
          className={classes.itemName}
        >
          {item.name}
        </Text>
        <Text fz="xs" fw="bold" className={classes.itemCategory}>
          {item.category}
        </Text>
        <ItemDescription itemDescription={item.description} />
      </Stack>
    </Card>
  );
};

export { CompactItemCard };
