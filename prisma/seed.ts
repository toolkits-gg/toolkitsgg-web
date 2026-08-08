import { serverEnv } from "#/env/server-env";
import { allGameDBSeeds } from "#/games-registry/db-registry";
import { auth } from "#/integrations/better-auth/auth";
import dotenv from "dotenv";
import { prisma } from "./client";

dotenv.config({ path: ".env.local" });

/**
 * Guarantees the account named by SUPER_ADMIN_EMAIL exists and holds a global
 * SUPERADMIN role - the one grant that can hand out every other one.
 *
 * An account that already exists keeps its password: re-running this against
 * production must never rotate live credentials out from under whoever holds
 * them.
 */
const ensureSuperAdmin = async () => {
	const email = serverEnv.SUPER_ADMIN_EMAIL;
	const existing = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	});

	let userId = existing?.id;

	if (!userId) {
		console.log("DB Seed: Creating super admin account...");
		// signUpEmail rather than prisma.user.create, so better-auth hashes the
		// password and the profile-creation hook fires.
		const result = await auth.api.signUpEmail({
			body: {
				email,
				password: serverEnv.SUPER_ADMIN_PASSWORD,
				name: "admin",
				username: "admin",
			},
		});
		userId = result.user.id;
		await prisma.user.update({
			where: { id: userId },
			data: { emailVerified: true },
		});
		await prisma.userProfile.upsert({
			where: { userId },
			update: {},
			create: { userId, displayName: "Toolkit Admin" },
		});
	}

	await prisma.userRole.upsert({
		where: {
			userId_role_gameId: { userId, role: "SUPERADMIN", gameId: "none" },
		},
		update: {},
		create: { userId, role: "SUPERADMIN", gameId: "none" },
	});

	return userId;
};

/**
 * Upserts every game's reference data. Contains no deletes, so
 * it is safe to run against any environment including production.
 */
const seedReferenceData = async () => {
	await ensureSuperAdmin();

	for (const [gameId, gameSeed] of Object.entries(allGameDBSeeds)) {
		console.log(`DB Seed: Seeding reference data for ${gameId}...`);
		await gameSeed.seedReferenceData();
	}
};

const isEntrypoint = process.argv[1]?.endsWith("prisma/seed.ts");

if (isEntrypoint) {
	const t0 = performance.now();
	console.log("DB Seed (reference): Started ...");

	seedReferenceData()
		.then(async () => {
			await prisma.$disconnect();
			console.info(
				`DB Seed (reference): Finished (${performance.now() - t0}ms)`,
			);
		})
		.catch(async (error: unknown) => {
			console.error("DB Seed (reference): Failed", error);
			await prisma.$disconnect();
			process.exit(1);
		});
}

export { ensureSuperAdmin, seedReferenceData };
