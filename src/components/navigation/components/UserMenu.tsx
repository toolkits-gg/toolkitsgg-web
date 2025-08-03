'use client';

import { IconChevronRight } from '@tabler/icons-react';
import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import classes from './UserMenu.module.css';
import { useAuth } from '@/features/auth/hooks/use-auth';

const UserMenu = () => {
  const { user } = useAuth();

  // TODO
  if (!user) {
    return <>No user</>;
  }

  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
          radius="xl"
        />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {user?.username}
          </Text>

          <Text c="dimmed" size="xs">
            {user.email}
          </Text>
        </div>

        <IconChevronRight size={14} stroke={1.5} />
        {/** TODO */}
      </Group>
    </UnstyledButton>
  );
};

export { UserMenu };
