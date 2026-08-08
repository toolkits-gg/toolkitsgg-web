/**
 * A minimal Prisma-shaped store over one IndexedDB object store.
 *
 * The app's local reads and writes are flat: equality-only `where`, one sort
 * field, relations stitched by hand in JS. Row types come from the Prisma
 * model types via `local-db.ts`, which keeps the schema the single source of
 * truth for what a local row looks like.
 *
 * Deliberately absent: relations, foreign keys, and operator objects in `where`.
 * The server is where integrity is checked. IndexedDB is a cache the sync queue
 * reconciles.
 */

import type { IndexNames, StoreNames, StoreValue } from "idb";
import { getLocalDB, type LocalDB } from "#/features/local-db/local-db";

type StoreName = StoreNames<LocalDB>;
type Row<Name extends StoreName> = StoreValue<LocalDB, Name>;
type Field<Name extends StoreName> = keyof Row<Name> & string;

type Where<Name extends StoreName> = Partial<Row<Name>>;
type OrderBy<Name extends StoreName> = Partial<
	Record<Field<Name>, "asc" | "desc">
>;

/**
 * Everything the row needs except what the store fills in: the declared
 * `defaults` plus `createdAt` / `updatedAt`.
 */
type CreateData<Name extends StoreName, Defaults> = Omit<
	Row<Name>,
	(keyof Defaults & string) | "createdAt" | "updatedAt"
> &
	Partial<Row<Name>>;

type StoreConfig<
	Name extends StoreName,
	Defaults extends Partial<Row<Name>>,
> = {
	name: Name;
	keyPath: Field<Name> | readonly Field<Name>[];
	indexes?: readonly IndexNames<LocalDB, Name>[];
	/** Mirrors the schema's `@default(...)` values, applied on create. */
	defaults?: Defaults;
	/**
	 * How `createdAt` / `updatedAt` are stored. Rows mirroring a Prisma model
	 * carry `Date`; rows that are themselves a wire shape carry ISO strings.
	 */
	timestamps?: "date" | "iso";
};

/** `undefined` means "leave this field alone", as it does in Prisma's own args. */
const definedFields = <T extends object>(fields: T): Partial<T> =>
	Object.fromEntries(
		Object.entries(fields).filter(([, value]) => value !== undefined),
	) as Partial<T>;

/** Dates are compared by their epoch value so they order alongside numbers. */
const sortKey = (value: unknown): number | string =>
	value instanceof Date ? value.getTime() : (value as number | string);

const compareValues = (a: unknown, b: unknown): number => {
	if (a === b) return 0;
	if (a == null) return 1;
	if (b == null) return -1;
	const left = sortKey(a);
	const right = sortKey(b);
	if (left === right) return 0;
	if (typeof left === "string" || typeof right === "string") {
		return String(left) < String(right) ? -1 : 1;
	}
	return left < right ? -1 : 1;
};

const createStore = <
	Name extends StoreName,
	Defaults extends Partial<Row<Name>> = Record<never, never>,
>(
	config: StoreConfig<Name, Defaults>,
) => {
	const { name, keyPath, indexes, defaults, timestamps = "date" } = config;
	const compoundKey = Array.isArray(keyPath);
	const keyFields: readonly Field<Name>[] = compoundKey
		? (keyPath as readonly Field<Name>[])
		: [keyPath as Field<Name>];

	const now = () =>
		timestamps === "iso" ? new Date().toISOString() : new Date();

	const openDb = async () => {
		const db = await getLocalDB();
		if (!db) throw new Error(`Local store "${name}" is browser-only`);
		return db;
	};

	// The public surface below is fully typed; these casts are confined to the
	// two places idb's key generics cannot see through a dynamic store name.
	const keyOf = (row: Where<Name>) => {
		const values = keyFields.map((field) => row[field]);
		return (compoundKey ? values : values[0]) as never;
	};

	const hasWholeKey = (where: Where<Name>) =>
		keyFields.every((field) => where[field] !== undefined);

	const matches = (row: Row<Name>, where: Where<Name>) =>
		Object.keys(where).every(
			(field) => row[field as Field<Name>] === where[field as Field<Name>],
		);

	const read = async (unfiltered?: Where<Name>): Promise<Row<Name>[]> => {
		const db = await openDb();
		const where = unfiltered && definedFields(unfiltered);

		if (where && hasWholeKey(where)) {
			const row = await db.get(name, keyOf(where));
			return row && matches(row, where) ? [row] : [];
		}

		const index = indexes?.find(
			(candidate) => where?.[candidate as Field<Name>] !== undefined,
		);
		const rows = index
			? await db.getAllFromIndex(
					name,
					index,
					where?.[index as Field<Name>] as never,
				)
			: await db.getAll(name);

		return where ? rows.filter((row) => matches(row, where)) : rows;
	};

	const stamp = (row: Row<Name>): Row<Name> => {
		const stamped = { ...row } as Record<string, unknown>;
		const at = now();
		if (stamped.createdAt === undefined) stamped.createdAt = at;
		if (stamped.updatedAt === undefined) stamped.updatedAt = at;
		return stamped as Row<Name>;
	};

	/** Merges an update onto an existing row, moving `updatedAt` unless given one. */
	const merge = (existing: Row<Name>, data: Partial<Row<Name>>): Row<Name> => {
		const row = { ...existing, ...definedFields(data) } as Record<
			string,
			unknown
		>;
		if (data.updatedAt === undefined) row.updatedAt = now();
		return row as Row<Name>;
	};

	const build = (data: CreateData<Name, Defaults>): Row<Name> =>
		stamp({ ...defaults, ...definedFields(data) } as Row<Name>);

	const write = async (row: Row<Name>) => {
		const db = await openDb();
		await db.put(name, row);
		return row;
	};

	return {
		findMany: async (args?: {
			where?: Where<Name>;
			orderBy?: OrderBy<Name>;
		}): Promise<Row<Name>[]> => {
			const rows = await read(args?.where);
			const sort = Object.entries(args?.orderBy ?? {}).find(
				([, direction]) => !!direction,
			);
			if (!sort) return rows;
			const [field, direction] = sort as [Field<Name>, "asc" | "desc"];
			const sign = direction === "desc" ? -1 : 1;
			return rows.sort((a, b) => compareValues(a[field], b[field]) * sign);
		},

		findUnique: async (args: {
			where: Where<Name>;
		}): Promise<Row<Name> | null> => {
			const [row] = await read(args.where);
			return row ?? null;
		},

		create: async (args: {
			data: CreateData<Name, Defaults>;
		}): Promise<Row<Name>> => write(build(args.data)),

		update: async (args: {
			where: Where<Name>;
			data: Partial<Row<Name>>;
		}): Promise<Row<Name>> => {
			const [existing] = await read(args.where);
			if (!existing) {
				throw new Error(`No ${name} row matches the update`);
			}
			return write(merge(existing, args.data));
		},

		updateMany: async (args: {
			where: Where<Name>;
			data: Partial<Row<Name>>;
		}): Promise<void> => {
			const rows = await read(args.where);
			for (const existing of rows) await write(merge(existing, args.data));
		},

		upsert: async (args: {
			where: Where<Name>;
			create: CreateData<Name, Defaults>;
			update: Partial<Row<Name>>;
		}): Promise<Row<Name>> => {
			const [existing] = await read(args.where);
			return write(
				existing ? merge(existing, args.update) : build(args.create),
			);
		},

		deleteMany: async (args: { where: Where<Name> }): Promise<void> => {
			const db = await openDb();
			const rows = await read(args.where);
			for (const row of rows) await db.delete(name, keyOf(row));
		},
	};
};

export type { OrderBy, Where };
export { createStore };
