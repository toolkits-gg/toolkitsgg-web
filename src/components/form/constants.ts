import type { ActionState } from '@/components/form/types';

export const EMPTY_ACTION_STATE: ActionState = {
  message: '',
  showToast: true,
  fieldErrors: {},
  timestamp: Date.now(),
};
