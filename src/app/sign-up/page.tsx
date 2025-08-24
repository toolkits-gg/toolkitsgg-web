import { Flex, Paper } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { SignUpForm } from '@/features/auth/components/SignUpForm';
import { getAuth } from '@/features/auth/queries/get-auth';
import classes from './Page.module.css';

export default async function SignUpPage() {
  const session = await getAuth();
  const user = session?.user;

  return (
    <PageLayout user={user} gameId={undefined}>
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
