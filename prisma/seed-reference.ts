import { allGameDBSeeds } from "#/game-registry/db-seed-registry";
import dotenv from "dotenv";
import { prisma } from "./client";

dotenv.config({ path: ".env.local" });

/**
 * Upserts every game's reference data. Contains no deletes and no fixtures, so
 * it is safe to run against any environment including production.
 */
const seedReferenceData = async () => {
	for (const [gameId, gameSeed] of Object.entries(allGameDBSeeds)) {
		console.log(`DB Seed: Seeding reference data for ${gameId}...`);
		await gameSeed.seedReferenceData();
	}
};

const isEntrypoint = process.argv[1]?.endsWith("seed-reference.ts");

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

export { seedReferenceData };
