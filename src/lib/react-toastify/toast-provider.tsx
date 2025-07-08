'use client';

import { useAppTheme } from '@/features/theme/hooks/use-theme';
import { ToastContainer } from 'react-toastify';

const ToastProvider = () => {
  const { mode } = useAppTheme();

  return <ToastContainer pauseOnFocusLoss={false} theme={mode} />;
};

export { ToastProvider };
