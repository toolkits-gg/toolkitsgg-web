import Link from 'next/link';
import { PageContainer } from '@/app/_navigation/page-container';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <PageContainer gameId={undefined}>
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Toolkits.gg
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-300">
            Coming soon! Toolkits.gg is a platform of tools and quality of life
            features for a variety of games. From the team behind{' '}
            <Link
              href="https://remnant2toolkit.com"
              className="text-white underline"
            >
              Remnant2Toolkit
            </Link>
            .
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-300">
            Join the Discord to stay up to date with the latest news an updates!
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button variant="secondary" asChild>
              <Link href="https://discord.gg/kgVaU3zAQ7">Join the Discord</Link>
            </Button>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </PageContainer>
  );
}
