'use client';

import { AppNavbar } from '@/components/navigation/AppNavbar';
import { PageLayout } from '@/components/PageLayout';
import { SignInForm } from '@/features/auth/components/SignInForm';
import { noGameConfig } from '@/features/game/constants';
import classes from './Page.module.css';
import { Flex, Paper } from '@mantine/core';

export default function SignInPage() {
  return (
    <PageLayout appNavbar={<AppNavbar gameConfig={noGameConfig} />}>
      <Flex align="center" justify="center" p="xl">
        <Paper
          radius="md"
          p="lg"
          withBorder
          className={classes.paper}
          w="100%"
          maw="400px"
        >
          <SignInForm />
        </Paper>
      </Flex>
    </PageLayout>
  );
}
