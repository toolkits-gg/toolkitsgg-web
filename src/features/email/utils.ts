import { clientEnv } from "#/env/client-env.ts";

const getNoReplyFrom = () =>
	`${clientEnv.VITE_APP_NAME} <${clientEnv.VITE_APP_NOREPLY_EMAIL}>`;

export { getNoReplyFrom };
