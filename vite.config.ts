import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

// biome-ignore lint/style/noDefaultExport: <not a problem in the config>
export default defineConfig(({ command: _, mode }) => {
	// Vite only exposes VITE_-prefixed vars, and never on process.env, so the
	// source map upload token has to be read out of the env files explicitly.
	const env = loadEnv(mode, process.cwd(), "SENTRY_");

	return {
		server: {
			port: 3000,
			// Subdomain routing can only be exercised locally over a real host,
			// e.g. remnant2.localhost:3000.
			allowedHosts: [".localhost", ".toolkits.gg"],
		},
		resolve: {
			tsconfigPaths: true,
		},
		plugins: [
			tanstackStart(),
			sentryTanstackStart({
				org: "toolkitsgg",
				project: "toolkitsgg-web",
				authToken: env.SENTRY_AUTH_TOKEN,
			}),
			nitro(),
			viteReact(),
		],
	};
});
