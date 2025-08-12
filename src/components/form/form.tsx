import { useActionFeedback } from './hooks/use-action-feedback';
import { ActionState } from './utils/to-action-state';

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
        // TODO toast.success(actionState.message, toastOptions);
      }

      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      if (actionState.message && actionState.showToast) {
        // TODO toast.error(actionState.message, toastOptions);
      }

      onError?.(actionState);
    },
  });

  return (
    <form action={action} className="flex flex-col gap-y-2">
      {children}
    </form>
  );
};

export { Form };
