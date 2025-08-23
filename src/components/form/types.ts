export type ActionState<T = any> = {
  status?: 'SUCCESS' | 'ERROR';
  message: string;
  showToast?: boolean;
  payload?: FormData;
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number;
  data?: T;
};
