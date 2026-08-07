import { allGameDBSeeds } from "#/game-registry/game-db-seed-registry";

import { auth } from "#/integrations/better-auth/auth";
import dotenv from 'dotenv'
import { prisma } from "./client";
import { seedReferenceData } from "./seed-reference";

dotenv.config({ path: '.env.local' });

const requireLocalEnv = (key: string) => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`DB Seed: missing required variable ${key} in .env.local`);
	}
	return value;
};

const seededUsers = [
	{
		username: "admin",
		email: requireLocalEnv("LOCAL_ADMIN_EMAIL"),
		password: requireLocalEnv("LOCAL_ADMIN_PASSWORD"),
		emailVerified: true,
	},
	{
		username: "user",
		email: requireLocalEnv("LOCAL_USER_EMAIL"),
		password: requireLocalEnv("LOCAL_USER_PASSWORD"),
		emailVerified: true
	}
];

const seededUserProfiles = [
	{
		displayName: "Toolkit Admin",
		bio: "Toolkit Admin bio here",
		avatarUrl: undefined,
	},
	{
		displayName: "Toolkit User",
		bio: "Toolkit User bio here",
		avatarUrl: undefined,
	}
];

/**
 * Wipes user-generated data and recreates the local test accounts. Destructive:
 * never point this at an environment whose users matter.
 */
const seedLocalFixtures = async () => {
	for (const [gameId, gameSeed] of Object.entries(allGameDBSeeds)) {
		if (!gameSeed.resetUserData) continue;
		console.log(`DB Seed: Resetting user data for ${gameId}...`);
		await gameSeed.resetUserData();
	}

	try {
		await Promise.all([
			prisma.userAvatarOverride.deleteMany(),
			prisma.userProfile.deleteMany(),
			prisma.userFavoriteGame.deleteMany(),
			prisma.userFollowedUsers.deleteMany(),
			prisma.userRole.deleteMany(),
		]);
		await prisma.user.deleteMany();
	} catch (_error: unknown) {
		console.warn("DB Seed: Skipping cleanup (fresh database)");
	}

	await Promise.all(
		seededUsers.filter(user => user.email && user.password).map(async (user, index) => {
			const result = await auth.api.signUpEmail({
				body: {
					email: user.email as string, // filtered prior
					password: user.password as string, // filtered prior
					name: user.username,
					username: user.username,
				},
			});

			const userId = result.user.id;

			if (user.emailVerified) {
				await prisma.user.update({
					where: { id: userId },
					data: { emailVerified: true },
				});
			}

			await prisma.userProfile.create({
				data: {
					...seededUserProfiles[index],
					userId,
				},
			});

			return result.user;
		}),
	);
};

const seed = async () => {
	const t0 = performance.now();
	console.log("DB Seed: Started ...");

	await seedLocalFixtures();
	await seedReferenceData();

	const t1 = performance.now();
	console.log(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed()
	.then(async () => {
		await prisma.$disconnect();
		console.info('Seed successfully ran.');
	})
	.catch(async (error: unknown) => {
		console.error('DB Seed: Failed', error);
		await prisma.$disconnect();
		process.exit(1);
	});
