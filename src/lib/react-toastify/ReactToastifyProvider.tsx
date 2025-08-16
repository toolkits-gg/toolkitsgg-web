'use client';

import { useMantineColorScheme } from '@mantine/core';
import { ToastContainer } from 'react-toastify';

const ReactToastifyProvider = () => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <ToastContainer
      pauseOnFocusLoss={false}
      theme={colorScheme === 'auto' ? 'dark' : colorScheme}
      limit={2}
    />
  );
};

export { ReactToastifyProvider };
