import type { ActionState } from '@/components/form/utils';
import { useEffect, useRef } from 'react';

type OnArgs = {
  actionState: ActionState;
};

type UseActionFeedbackOptions = {
  onSuccess?: (onArgs: OnArgs) => void;
  onError?: (onArgs: OnArgs) => void;
};

const useActionFeedback = (
  actionState: ActionState | undefined,
  options: UseActionFeedbackOptions
) => {
  const prevTimestamp = useRef(actionState?.timestamp);
  const isUpdate = prevTimestamp.current !== actionState?.timestamp;

  useEffect(() => {
    if (!isUpdate) return;
    if (!actionState) return;

    if (actionState.status === 'SUCCESS') {
      options.onSuccess?.({ actionState });
    }

    if (actionState.status === 'ERROR') {
      options.onError?.({ actionState });
    }

    prevTimestamp.current = actionState.timestamp;
  }, [isUpdate, actionState, options]);
};

export { useActionFeedback };
