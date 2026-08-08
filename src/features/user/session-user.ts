import { createServerFn } from "@tanstack/react-start";
import {
	getSessionUser,
	type SessionUser,
} from "#/features/user/session-user.server";

export const getSessionUserServerFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<SessionUser | null> => getSessionUser());
