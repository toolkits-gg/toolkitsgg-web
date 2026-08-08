import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { setPassword } from "#/features/user/set-password.server";

const SetPasswordInput = z.object({ newPassword: z.string().min(8).max(128) });

export const setPasswordServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => SetPasswordInput.parse(v))
	.handler(async ({ data }) => setPassword(data.newPassword));
