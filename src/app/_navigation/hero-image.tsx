import { cloneElement } from 'react';
import { Typography } from '@/components/typography';

type HeroImageProps = {
  image: React.ReactElement<HTMLImageElement>;
  title?: string;
  text?: string;
  options?: {
    imageOverlayOpacity?: number;
  };
};

const HeroImage = ({ image, title, text, options = {} }: HeroImageProps) => {
  const { imageOverlayOpacity = 85 } = options;

  return (
    <div className="border-primary relative isolate overflow-hidden rounded-xl border bg-black py-12 sm:py-16">
      {cloneElement(image, {
        className: 'absolute inset-0 -z-10 size-full object-cover',
      })}
      <div
        id="image-overlay"
        className="absolute inset-0 -z-10 bg-black"
        style={{
          opacity: `${imageOverlayOpacity}%`,
        }}
      />
      <div
        aria-hidden="true"
        className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="to-primary from-secondary aspect-1097/845 w-274.25 bg-linear-to-tr opacity-20"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="from-primary to-secondary aspect-1097/845 w-274.25 bg-linear-to-tr opacity-20"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          {title && (
            // <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            //   {title}
            // </h2>
            <Typography variant="h2">{title}</Typography>
          )}
          {text && (
            // <p className="mt-8 truncate text-lg font-medium text-pretty text-gray-300 sm:text-xl/8">
            //   {text}
            // </p>
            <Typography variant="p">{text}</Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export { HeroImage };
