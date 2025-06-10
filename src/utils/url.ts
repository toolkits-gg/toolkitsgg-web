import type { GameId } from '@prisma/client';

export const getBaseUrl = () => {
  const environment = process.env.NODE_ENV;

  const baseUrl =
    environment === 'development'
      ? 'http://localhost:3000'
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  return baseUrl;
};

export const getImageUrl = (imagePath: string, gameId?: GameId) => {
  if (!imagePath) {
    return '';
  }

  let imageUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
  imageUrl = gameId
    ? `${imageUrl}/games/${gameId}/${imagePath}`
    : `${imageUrl}/${imagePath}`;

  return imageUrl;
};
