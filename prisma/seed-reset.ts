import { allGameDBSeeds } from "#/games-registry/db-registry";

import { auth } from "#/integrations/better-auth/auth";
import dotenv from 'dotenv'
import type { GameId, Role } from "@/prisma";
import { prisma } from "./client";
import { ensureSuperAdmin, seedReferenceData } from "./seed";

dotenv.config({ path: '.env.local' });

const requireLocalEnv = (key: string) => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`DB Seed: missing required variable ${key} in .env.local`);
	}
	return value;
};

type SeededUser = {
	username: string;
	email: string | undefined;
	password: string | undefined;
	emailVerified: boolean;
	profile: { displayName: string; bio: string; avatarUrl?: string };
	roles: { role: Role; gameId: GameId }[];
};

/**
 * The super admin is not here: `ensureSuperAdmin()` owns that account so the
 * same code path runs locally and in production.
 *
 * The moderator portion is optional; it exists to give
 * something to test against.
 */
const seededUsers: SeededUser[] = [
	{
		username: "user",
		email: requireLocalEnv("LOCAL_USER_EMAIL"),
		password: requireLocalEnv("LOCAL_USER_PASSWORD"),
		emailVerified: true,
		profile: {
			displayName: "Toolkit User",
			bio: "Toolkit User bio here",
		},
		roles: [],
	},
	{
		username: "moderator",
		email: process.env.LOCAL_MODERATOR_EMAIL,
		password: process.env.LOCAL_MODERATOR_PASSWORD,
		emailVerified: true,
		profile: {
			displayName: "Toolkit Moderator",
			bio: "Remnant 2 moderator",
		},
		roles: [{ role: "MODERATOR", gameId: "remnant2" }],
	},
];

/**
 * Wipes user-generated data and recreates the local test accounts.
 * !Destructive: never point this at an environment whose users matter.
 */
const seedLocalData = async () => {
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
			prisma.moderationReviewItem.deleteMany(),
			prisma.moderationAction.deleteMany(),
		]);
		await prisma.user.deleteMany();
	} catch (_error: unknown) {
		console.warn("DB Seed: Skipping cleanup (fresh database)");
	}

	// Recreated first, so the seeded users below never collide
	// with it on the unique email.
	await ensureSuperAdmin();

	await Promise.all(
		seededUsers.filter(user => user.email && user.password).map(async (user) => {
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

			await prisma.userProfile.upsert({
				where: { userId },
				update: user.profile,
				create: {
					...user.profile,
					userId,
				},
			});

			for (const grant of user.roles) {
				await prisma.userRole.create({
					data: { userId, role: grant.role, gameId: grant.gameId },
				});
			}

			return result.user;
		}),
	);
};

const seed = async () => {
	const t0 = performance.now();
	console.log("DB Seed: Started ...");

	await seedLocalData();
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
