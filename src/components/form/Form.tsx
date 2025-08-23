import { toast } from 'react-toastify';
import type { ActionState } from '@/components/form/types';
import { useActionFeedback } from './hooks/use-action-feedback';

type FormProps = {
  action: (payload: FormData) => void;
  actionState: ActionState;
  children: React.ReactNode;
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
  // TODO toastOptions?: ToastOptions | undefined;
  toastOptions?: undefined;
};

const Form = ({
  action,
  actionState,
  children,
  onSuccess,
  onError,
  toastOptions,
}: FormProps) => {
  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message && actionState.showToast) {
        toast.success(actionState.message, toastOptions);
      }

      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      if (actionState.message && actionState.showToast) {
        toast.error(actionState.message, toastOptions);
      }

      onError?.(actionState);
    },
  });

  return <form action={action}>{children}</form>;
};

export { Form };
