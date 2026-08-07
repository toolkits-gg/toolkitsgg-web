import { type Prisma, prisma } from "@/prisma";

const CHUNK_SIZE = 100;
const CHUNK_TIMEOUT_MS = 30_000;

/**
 * Applies reference-data upserts in bounded batches.
 *
 * One transaction per game would mean thousands of sequential round trips, which
 * blows Prisma's 5s interactive-transaction timeout against a networked
 * database even though it passed against a local one. Batching is safe here
 * because the upserts are idempotent, so a run that fails partway is corrected
 * by running it again.
 */
const upsertInChunks = async (
	operations: Prisma.PrismaPromise<unknown>[],
): Promise<void> => {
	for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
		await prisma.$transaction(operations.slice(i, i + CHUNK_SIZE), {
			timeout: CHUNK_TIMEOUT_MS,
		});
	}
};

export { upsertInChunks };
