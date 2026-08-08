/**
 * Shared server-side CRUD for collected items.
 *
 * Every game's collected-item table is the same presence join, so the auth and
 * rate-limit sequencing lives here once. A game supplies its prisma delegate and
 * gets the four reads/writes its server fns delegate to.
 */

import { asCollectedItemTable } from "#/features/game/data/collected-items/collected-item-table";
import type { CollectedItemRecord } from "#/features/game/data/types";
import { requireUserId } from "#/features/user/require-user.server";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";

type CollectedItemsCrud = {
	collectItem: (itemId: string) => Promise<CollectedItemRecord>;
	uncollectItem: (itemId: string) => Promise<{ ok: true }>;
	listCollectedItems: () => Promise<CollectedItemRecord[]>;
	listCollectedItemsByUserId: (
		userId: string,
	) => Promise<CollectedItemRecord[]>;
};

const createCollectedItemsCrud = (delegate: unknown): CollectedItemsCrud => {
	const table = asCollectedItemTable(delegate);

	return {
		collectItem: async (itemId) => {
			const userId = await requireUserId();
			await enforceUserWriteLimit(userId);
			return table.upsert({
				where: { userId_itemId: { userId, itemId } },
				update: {},
				create: { userId, itemId },
			});
		},

		uncollectItem: async (itemId) => {
			const userId = await requireUserId();
			await enforceUserWriteLimit(userId);
			await table.deleteMany({ where: { userId, itemId } });
			return { ok: true as const };
		},

		listCollectedItems: async () => {
			const userId = await requireUserId();
			return table.findMany({ where: { userId } });
		},

		listCollectedItemsByUserId: (userId) =>
			table.findMany({ where: { userId } }),
	};
};

export type { CollectedItemsCrud };
export { createCollectedItemsCrud };
