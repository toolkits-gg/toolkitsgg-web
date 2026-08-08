import {
	sentryGlobalFunctionMiddleware,
	sentryGlobalRequestMiddleware,
} from "@sentry/tanstackstart-react";
import {
	createCsrfMiddleware,
	createMiddleware,
	createStart,
} from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
	filter: (ctx) => ctx.handlerType === "serverFn",
});

/**
 * A `Response` thrown from a server fn (`requireUserId`, capability checks, the
 * write rate limiter) is delivered to the browser as the call's return value
 * rather than as a rejection, so an unauthorized read resolves with a 401
 * `Response` where the caller expects its data. Rethrowing it here matches what
 * the same throw already does when the server fn runs during SSR.
 */
const throwErrorResponses = createMiddleware({ type: "function" }).client(
	async ({ next }) => {
		const ctx = await next();
		const { result } = ctx as typeof ctx & { result?: unknown };
		if (result instanceof Response && !result.ok) throw result;
		return ctx;
	},
);

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [sentryGlobalRequestMiddleware, csrfMiddleware],
		functionMiddleware: [throwErrorResponses, sentryGlobalFunctionMiddleware],
	};
});
