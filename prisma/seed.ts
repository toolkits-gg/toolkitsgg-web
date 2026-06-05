import { allGameDBSeeds } from "#/features/game/registry/game-db-seed-registry";

import { auth } from "#/integrations/better-auth/auth";
import { prisma } from "./client";
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' });

const seededUsers = [
	{
		username: "admin",
		email: process.env.VITE_LOCAL_ADMIN_EMAIL,
		password: process.env.VITE_LOCAL_ADMIN_PASSWORD,
		emailVerified: true,
	},
	{
		username: "user",
		email: process.env.VITE_LOCAL_USER_EMAIL,
		password: process.env.VITE_LOCAL_USER_PASSWORD,
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

const seed = async () => {
	const t0 = performance.now();
	console.log("DB Seed: Started ...");

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

	await Promise.all(
		Object.entries(allGameDBSeeds).map(async ([gameId, gameSeed]) => {
			console.log(`DB Seed: Seeding items for ${gameId}...`);
			await gameSeed.seed();
		}),
	);

	const t1 = performance.now();
	console.log(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed().then(() => console.info('Seed successfully ran.'));
