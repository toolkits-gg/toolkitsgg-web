import {
	banMessage,
	getViewerContext,
} from "#/features/auth/viewer-context.server";

/**
 * Every write already funnels through here, which makes it the one place a ban
 * has to be enforced.
 */
const requireUserId = async (): Promise<string> => {
	const { userId, ban } = await getViewerContext();
	if (!userId) throw new Response("Unauthorized", { status: 401 });
	if (ban) throw new Response(banMessage(ban), { status: 403 });
	return userId;
};

/** A banned user reads the site as a guest rather than as themselves. */
const getOptionalUserId = async (): Promise<string | null> => {
	const { userId, ban } = await getViewerContext();
	return ban ? null : (userId ?? null);
};

export { getOptionalUserId, requireUserId };
