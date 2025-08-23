import { Flex, Paper } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { PasswordResetForm } from '@/features/password/components/PasswordResetForm';
import classes from './Page.module.css';

type PasswordResetPageProps = {
  params: Promise<{
    tokenId: string;
  }>;
};

const PasswordResetPage = async ({ params }: PasswordResetPageProps) => {
  const { tokenId } = await params;

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
          <PasswordResetForm tokenId={tokenId} />
        </Paper>
      </Flex>
    </PageLayout>
  );
};

export default PasswordResetPage;
