import { getIDBClient } from "#/integrations/prisma-idb/idb-client";
import { allGameIDBSeeds } from "#/registry/game-idb-seed-registry";
import type { GameId } from "@/prisma";

const LOCAL_USER_ID = "local-user";
const PROFILE_SEED_FLAG_KEY = "idb-seeded-profile";

let sentinelUserPromise: Promise<void> | null = null;
let profileSeedPromise: Promise<void> | null = null;
const gameSeedPromises = new Map<string, Promise<void>>();

const ensureSentinelUser = () => {
	if (sentinelUserPromise) return sentinelUserPromise;

	sentinelUserPromise = (async () => {
		const idb = await getIDBClient();

		const existingUser = await idb.user.findUnique({
			where: { id: LOCAL_USER_ID },
		});
		if (!existingUser) {
			await idb.user.create({
				data: {
					id: LOCAL_USER_ID,
					username: "local",
					email: "local@local",
					updatedAt: new Date(),
				},
			});
		}
	})();

	return sentinelUserPromise;
};

const seedIDBForGame = (gameId?: Exclude<GameId, "none">): Promise<void> => {
	if (typeof window === "undefined") return Promise.resolve();

	if (gameId) {
		const gameSeed = allGameIDBSeeds[gameId];
		if (!gameSeed || localStorage.getItem(gameSeed.seedFlag))
			return Promise.resolve();

		const existing = gameSeedPromises.get(gameId);
		if (existing) return existing;

		const promise = (async () => {
			await ensureSentinelUser();
			await gameSeed.seed();
			localStorage.setItem(gameSeed.seedFlag, "true");
		})();

		gameSeedPromises.set(gameId, promise);
		return promise;
	}

	const unseededGames = Object.entries(allGameIDBSeeds).filter(
		([, gameSeed]) => !localStorage.getItem(gameSeed.seedFlag),
	);
	if (unseededGames.length === 0) return Promise.resolve();

	return Promise.all(
		unseededGames.map(([id]) => seedIDBForGame(id as Exclude<GameId, "none">)),
	).then(() => {});
};

const seedIDBProfile = () => {
	if (typeof window === "undefined") return Promise.resolve();

	if (localStorage.getItem(PROFILE_SEED_FLAG_KEY)) return Promise.resolve();

	if (profileSeedPromise) return profileSeedPromise;

	profileSeedPromise = (async () => {
		await ensureSentinelUser();

		const idb = await getIDBClient();

		const existingProfile = await idb.userProfile.findFirst({
			where: { userId: LOCAL_USER_ID },
		});
		if (!existingProfile) {
			await idb.userProfile.create({
				data: {
					id: "local-user-profile",
					userId: LOCAL_USER_ID,
					displayName: "Traveler",
					bio: "No bio provided.",
					updatedAt: new Date(),
				},
			});
		}

		localStorage.setItem(PROFILE_SEED_FLAG_KEY, "true");
	})();

	return profileSeedPromise;
};

export { LOCAL_USER_ID, seedIDBForGame, seedIDBProfile };
