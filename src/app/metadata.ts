import { type Metadata } from 'next';

const title = 'Toolkits.gg';
const description =
  'A site dedicated to toolkits and quality of life features for a variety of games.';
const url = 'https://toolkits.gg';

export const metadata: Metadata = {
  metadataBase: new URL('https://d1ig3kkc8hj9hz.cloudfront.net'),
  title,
  description,
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      new URL('/favicon-32x32.png', url),
    ],
    shortcut: ['/favicon-32x32.png'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title,
    description,
    url,
    siteName: title,
    images: [
      {
        url: 'https://d1ig3kkc8hj9hz.cloudfront.net/metadata/og-image.png', // TODO
        width: 150,
        height: 150,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
    siteId: '1696952720974888960',
    creator: '@josh_payette',
    creatorId: '1696952720974888960',
    images: [
      {
        url: 'https://d1ig3kkc8hj9hz.cloudfront.net/metadata/og-image.png', // TODO
        width: 150,
        height: 150,
      },
    ],
  },
};
