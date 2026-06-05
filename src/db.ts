import { PrismaPg } from "@prisma/adapter-pg";
import { serverEnv } from "#/env.ts";
import { PrismaClient } from "@/prisma";

const adapter = new PrismaPg({
	connectionString: serverEnv.DATABASE_URL,
});

declare global {
	// noinspection ES6ConvertVarToLetConst
	var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma = prisma;
}

export { prisma };
