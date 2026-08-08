import { Resend } from "resend";
import { serverEnv } from "#/env/server-env";

const resend = new Resend(serverEnv.RESEND_KEY);

export { resend };
