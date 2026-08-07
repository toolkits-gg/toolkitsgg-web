import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// biome-ignore lint/style/noDefaultExport: <not a problem in the config>
export default defineConfig({
	server: {
		port: 3000,
	},
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
		tanstackStart(),
		nitro(),
		// react's vite plugin must come after start's vite plugin
		viteReact(),
	],
});
