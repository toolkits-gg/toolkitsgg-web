'use client';

import type { BaseItemType } from '@/features/item/types';
import classes from './ItemCard.module.css';
import { Card, Group, Image, Stack, Text } from '@mantine/core';
import NextImage from 'next/image';

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
      <Text mt="sm" mb="md" fz="sm">
        {desc}
      </Text>
    ));
};

export type ItemCardProps = {
  item: ItemCardItemType;
} & ImageProps;

const ItemCard = ({ item, imageSrc, imageContent }: ItemCardProps) => {
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
        className={classes.content}
        h="100%"
        w="100%"
        justify="flex-start"
        align="flex-start"
        gap="xs"
      >
        <Text fz="h2" fw="bolder" className={classes.title}>
          {item.name}
        </Text>
        <Text fz="xs" fw="bold" className={classes.category}>
          {item.category}
        </Text>
        <ItemDescription itemDescription={item.description} />
      </Stack>
    </Card>
  );
};

export { ItemCard };
