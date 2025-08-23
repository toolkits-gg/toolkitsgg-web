'use client';

import {
  Box,
  Collapse,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import classes from './NavbarLinksGroup.module.css';

interface NavbarLinksGroupProps {
  icon: React.FC<any> | undefined;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
}

const NavbarLinksGroup = ({
  icon: Icon,
  label,
  initiallyOpened,
  links,
}: NavbarLinksGroupProps) => {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const items = (hasLinks ? links : []).map((link) => (
    <Text
      component={Link}
      className={classes.link}
      href={link.link}
      key={link.label}
    >
      {link.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {Icon && (
              <ThemeIcon variant="light" size={30}>
                <Icon size={18} />
              </ThemeIcon>
            )}
            <Box ml="md" className={classes.label}>
              {label}
            </Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              size={16}
              style={{ transform: opened ? 'rotate(-90deg)' : 'none' }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
};

export { NavbarLinksGroup };
