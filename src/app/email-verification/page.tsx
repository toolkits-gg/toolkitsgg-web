import { Flex, Paper } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { EmailVerificationForm } from '@/features/auth/components/EmailVerificationForm';
import { EmailVerificationResendForm } from '@/features/auth/components/EmailVerificationResendForm';
import { getAuth } from '@/features/auth/queries/get-auth';
import classes from './Page.module.css';

export async function EmailVerificationPage() {
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
          <EmailVerificationForm />
          <EmailVerificationResendForm />
        </Paper>
      </Flex>
    </PageLayout>
  );
}

export default EmailVerificationPage;
