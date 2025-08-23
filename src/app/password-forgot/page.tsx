import { Flex, Paper } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { PasswordForgotForm } from '@/features/password/components/PasswordForgotForm';
import classes from './Page.module.css';

const PasswordForgotPage = () => {
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
          <PasswordForgotForm />
        </Paper>
      </Flex>
    </PageLayout>
  );
};

export default PasswordForgotPage;
