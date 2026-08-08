import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createSubdomainRewrite } from "./features/game/subdomain-rewrite";
import { getContext } from "./integrations/tanstack-query/get-context";
import { routeTree } from "./routeTree.gen";

function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		rewrite: createSubdomainRewrite(routeTree),
		// The router swallows render/loader errors into its own catch boundary,
		// so Sentry's global handlers never see them.
		defaultOnCatch: (error, errorInfo) => {
			Sentry.captureException(error, {
				captureContext: {
					contexts: { react: { componentStack: errorInfo.componentStack } },
				},
			});
		},
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	if (!router.isServer) {
		Sentry.addIntegration(
			Sentry.tanstackRouterBrowserTracingIntegration(router),
		);
	}

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}

export { getRouter };
