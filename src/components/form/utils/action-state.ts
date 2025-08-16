import { ZodError } from 'zod';

export type ActionState<T = any> = {
  status?: 'SUCCESS' | 'ERROR';
  message: string;
  showToast?: boolean;
  payload?: FormData;
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number;
  data?: T;
};

export const EMPTY_ACTION_STATE: ActionState = {
  message: '',
  showToast: true,
  fieldErrors: {},
  timestamp: Date.now(),
};

export const fromErrorToActionState = ({
  error,
  formData,
  showToast = true,
}: {
  error: unknown;
  formData?: FormData;
  showToast?: boolean;
}): ActionState => {
  if (error instanceof ZodError) {
    return {
      status: 'ERROR',
      message: '',
      showToast,
      payload: formData,
      fieldErrors: error.flatten().fieldErrors,
      timestamp: Date.now(),
    };
  } else if (error instanceof Error) {
    return {
      status: 'ERROR',
      message: error.message,
      showToast,
      payload: formData,
      fieldErrors: {},
      timestamp: Date.now(),
    };
  } else {
    return {
      status: 'ERROR',
      message: 'An unknown error occurred',
      payload: formData,
      fieldErrors: {},
      timestamp: Date.now(),
    };
  }
};

export const toActionState = ({
  status = 'SUCCESS',
  message = '',
  showToast = true,
  formData,
  data,
}: {
  status: ActionState['status'];
  message: string;
  showToast?: boolean;
  formData?: FormData;
  data?: unknown;
}): ActionState => {
  return {
    status,
    message,
    showToast,
    fieldErrors: {},
    payload: formData,
    timestamp: Date.now(),
    data,
  };
};
