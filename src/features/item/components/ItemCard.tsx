'use client';

import type { BaseItemType } from '@/features/item/types';
import classes from './ItemCard.module.css';
import { Card, Group, Image, RingProgress, Text } from '@mantine/core';
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

export type ItemCardProps = {
  item: ItemCardItemType;
} & ImageProps;

const ItemCard = ({ item, imageSrc, imageContent }: ItemCardProps) => {
  return (
    <Card withBorder padding="lg" radius="md" className={classes.card}>
      <Card.Section className={classes.imageContainer}>
        <Image
          src={imageSrc}
          alt={`Image of ${item.name}`}
          fill
          sizes="225px"
          component={NextImage}
          className={classes.image}
        />
      </Card.Section>

      <Group justify="space-between" mt="lg">
        <Text className={classes.title}>{item.name}</Text>
        <Group gap={5}>
          <Text fz="xs" c="dimmed">
            {item.category}
          </Text>
        </Group>
      </Group>
      {item.description && (
        <Text mt="sm" mb="md" c="dimmed" fz="xs">
          {item.description}
        </Text>
      )}
    </Card>
  );
};

export { ItemCard };
