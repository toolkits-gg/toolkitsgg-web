'use client';

import {
  Avatar,
  Button,
  Flex,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import {
  IconChevronRight,
  IconHeart,
  IconLogout,
  IconRectangleRoundedTop,
  IconSettings,
  IconStar,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { signOut } from '@/features/auth/actions/sign-out';
import type { UserWithProfile } from '@/features/auth/types';
import { signInPath, signUpPath } from '@/paths';
import classes from './UserMenu.module.css';

// TODO: Add paths to the user items

type UserMenuProps = {
  user: UserWithProfile;
};

const UserMenu = ({ user }: UserMenuProps) => {
  const [actionState, action, isPending] = useActionState(
    signOut,
    EMPTY_ACTION_STATE
  );

  const theme = useMantineTheme();

  if (!user || !user.userProfile) {
    return (
      <Flex align="center" justify="space-between" w="100%" gap="md">
        <Button component={Link} href={signUpPath()} w="100%" variant="subtle">
          Sign up
        </Button>
        <Button component={Link} href={signInPath()} w="100%" variant="filled">
          Sign in
        </Button>
      </Flex>
    );
  }

  return (
    <Group justify="center" w="100%">
      <Menu
        withArrow
        width={300}
        position="bottom"
        transitionProps={{ transition: 'pop' }}
        withinPortal
        classNames={{
          dropdown: classes.menuDropdown,
          item: classes.menuItem,
          divider: classes.menuDivider,
        }}
      >
        <Menu.Target>
          <UnstyledButton className={classes.user}>
            <Group wrap="nowrap">
              <Avatar src={user.userProfile.avatarUrl} radius="xl" />

              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {user.userProfile.displayName}
                </Text>

                <Text c="dimmed" size="xs">
                  {user.email}
                </Text>
              </div>

              <IconChevronRight size={14} stroke={1.5} />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>
            <Group>
              <Avatar radius="xl" src={user.userProfile.avatarUrl} />

              <div>
                <Text fw={500}>{user.userProfile.displayName}</Text>
                <Text size="xs" c="dimmed">
                  {user.email}
                </Text>
              </div>
            </Group>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            leftSection={
              <IconHeart size={16} stroke={1.5} color={theme.colors.red[6]} />
            }
          >
            Liked builds
          </Menu.Item>
          <Menu.Item
            leftSection={
              <IconStar size={16} stroke={1.5} color={theme.colors.yellow[6]} />
            }
          >
            Saved builds
          </Menu.Item>
          <Menu.Item
            leftSection={
              <IconRectangleRoundedTop
                size={16}
                stroke={1.5}
                color={theme.colors.blue[6]}
              />
            }
          >
            Your collections
          </Menu.Item>

          <Menu.Label>Settings</Menu.Label>
          <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
            Account settings
          </Menu.Item>
          <Menu.Item
            leftSection={<IconSwitchHorizontal size={16} stroke={1.5} />}
          >
            Change account
          </Menu.Item>

          <Menu.Item
            leftSection={<IconLogout size={16} stroke={1.5} />}
            component="div"
          >
            <Form action={action} actionState={actionState}>
              <SubmitButton
                tooltip="Log out of your account"
                isPending={isPending}
                variant="transparent"
                p={0}
                fw={400}
                className={classes.menuItem}
              >
                Log out
              </SubmitButton>
            </Form>
          </Menu.Item>

          {/* 
          <Menu.Divider />

          <Menu.Label>Danger zone</Menu.Label>
          <Menu.Item leftSection={<IconPlayerPause size={16} stroke={1.5} />}>
            Pause subscription
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} stroke={1.5} />}
          >
            Delete account
          </Menu.Item> */}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export { UserMenu };
