import { Flex, Paper } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { EmailVerificationForm } from '@/features/auth/components/EmailVerificationForm';
import { EmailVerificationResendForm } from '@/features/auth/components/EmailVerificationResendForm';
import classes from './Page.module.css';

const EmailVerificationPage = () => {
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
          <EmailVerificationForm />
          <EmailVerificationResendForm />
        </Paper>
      </Flex>
    </PageLayout>
  );
};

export default EmailVerificationPage;
