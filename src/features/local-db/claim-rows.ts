/**
 * Moves locally-owned rows from one user id to another, used when an anonymous
 * visitor signs in and their local data has to follow them.
 *
 * Writing each row back whole is what covers both key shapes with one pass. A
 * build is keyed on its own id, so the write lands in place; a collected item
 * has the owner in its key, so the write lands under the new key and the old row
 * is dropped afterwards. Carrying the row's own `updatedAt` across matters:
 * it is what last-write-wins compares against the server, and a claim is not an
 * edit.
 *
 * A row whose key is derived from the owner rather than holding it outright
 * needs `rekey`, or the new owner's row lands under the old owner's key and the
 * next write to it creates a duplicate.
 */

type ClaimableStore<Row extends object> = {
	findMany(args: { where: Partial<Row> }): Promise<Row[]>;
	create(args: { data: Row }): Promise<unknown>;
	deleteMany(args: { where: Partial<Row> }): Promise<void>;
};

const claimLocalRows = async <Row extends object>(
	store: ClaimableStore<Row>,
	ownerField: keyof Row & string,
	fromUserId: string,
	toUserId: string,
	rekey?: (row: Row, toUserId: string) => Partial<Row>,
): Promise<void> => {
	const owned = { [ownerField]: fromUserId } as Partial<Row>;
	const rows = await store.findMany({ where: owned });
	for (const row of rows) {
		await store.create({
			data: { ...row, [ownerField]: toUserId, ...rekey?.(row, toUserId) },
		});
	}
	await store.deleteMany({ where: owned });
};

export type { ClaimableStore };
export { claimLocalRows };
