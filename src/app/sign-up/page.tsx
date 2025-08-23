import { Flex, Paper } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { SignUpForm } from '@/features/auth/components/SignUpForm';
import classes from './Page.module.css';

export default function SignUpPage() {
  return (
    <PageLayout gameId={undefined}>
      <Flex align="center" justify="center" p="xl">
        <Paper
          radius="md"
          p="lg"
          withBorder
          className={classes.paper}
          w="100%"
          maw="400px"
        >
          <SignUpForm />
        </Paper>
      </Flex>
    </PageLayout>
  );
}
