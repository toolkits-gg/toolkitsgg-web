import { createIsomorphicFn } from "@tanstack/react-start";
import pino from "pino";

const logger = createIsomorphicFn()
	.server(() =>
		pino({
			level: process.env.NODE_ENV === "production" ? "info" : "debug",
			transport: {
				target: "pino-pretty",
				options: {
					colorize: true,
				},
			},
		}),
	)
	.client(() =>
		pino({
			browser: {
				asObject: true,
			},
			level: process.env.NODE_ENV === "production" ? "info" : "debug",
			transport: {
				target: "pino-pretty",
				options: {
					colorize: true,
				},
			},
		}),
	)();

export { logger };
