'use client';

import { AppNavbar } from '@/components/navigation/AppNavbar';
import { PageLayout } from '@/components/PageLayout';
import { noGameConfig } from '@/features/game/constants';

export default function HomePage() {
  return (
    <PageLayout appNavbar={<AppNavbar gameConfig={noGameConfig} />}>
      Home Page
    </PageLayout>
  );
}
