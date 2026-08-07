import { getRequest } from "@tanstack/react-start/server";
import { auth } from "#/integrations/better-auth/auth.ts";

const requireUserId = async (): Promise<string> => {
	const request = getRequest();
	const session = await auth.api.getSession({ headers: request.headers });
	const userId = session?.user?.id;
	if (!userId) throw new Response("Unauthorized", { status: 401 });
	return userId;
};

const getOptionalUserId = async (): Promise<string | null> => {
	const request = getRequest();
	const session = await auth.api.getSession({ headers: request.headers });
	return session?.user?.id ?? null;
};

export { getOptionalUserId, requireUserId };
