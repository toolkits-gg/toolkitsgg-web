/**
 * Paginated wrapper around MediaWiki's Cargo `action=cargoquery` API. The API
 * caps each response at a created-builds-controlled limit (typically 500), so callers
 * with no upper bound on row count must keep fetching with increasing offsets
 * until a short page comes back.
 *
 * Each row in the response is wrapped in `{ title: {...} }`; this helper
 * unwraps that and returns flat row objects with the field aliases the caller
 * requested.
 *
 * Cargo returns field aliases with the alias name verbatim (e.g.
 * `require_dlc=dlc` becomes the key `dlc`), while non-aliased multi-word
 * field names come back with spaces (e.g. `require_dlc` -> `"require dlc"`).
 * The shape is preserved exactly as returned; callers can declare the row
 * type via the generic.
 */
import { fetchWithUserAgent } from "#/features/sync/wiki/utils.ts";

type CargoQueryParams = {
	apiUrl: string;
	tables: string;
	fields: string;
	where?: string;
	groupBy?: string;
	orderBy?: string;
	joinOn?: string;
	havingBy?: string;
	pageSize?: number;
};

type CargoRow = Record<string, string | number | boolean | null>;

type CargoResponse<TRow> = {
	cargoquery?: Array<{ title: TRow }>;
	error?: { code: string; info: string };
	warnings?: Record<string, unknown>;
};

const DEFAULT_PAGE_SIZE = 500;

const buildSearchParams = (
	params: CargoQueryParams,
	limit: number,
	offset: number,
): URLSearchParams => {
	const sp = new URLSearchParams({
		action: "cargoquery",
		format: "json",
		tables: params.tables,
		fields: params.fields,
		limit: String(limit),
		offset: String(offset),
	});
	if (params.where) sp.set("where", params.where);
	if (params.groupBy) sp.set("group_by", params.groupBy);
	if (params.orderBy) sp.set("order_by", params.orderBy);
	if (params.joinOn) sp.set("join_on", params.joinOn);
	if (params.havingBy) sp.set("having", params.havingBy);
	return sp;
};

const cargoQueryAll = async <TRow extends CargoRow = CargoRow>(
	params: CargoQueryParams,
): Promise<TRow[]> => {
	const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
	const all: TRow[] = [];
	let offset = 0;

	while (true) {
		const sp = buildSearchParams(params, pageSize, offset);
		const url = `${params.apiUrl}?${sp.toString()}`;
		const res = await fetchWithUserAgent(url);
		if (!res.ok) {
			throw new Error(
				`cargoquery failed (offset ${offset}): ${res.status} ${res.statusText}`,
			);
		}
		const body = (await res.json()) as CargoResponse<TRow>;
		if (body.error) {
			throw new Error(
				`cargoquery API error (${body.error.code}): ${body.error.info}`,
			);
		}
		const page = body.cargoquery ?? [];
		for (const entry of page) all.push(entry.title);

		if (page.length < pageSize) break;
		offset += pageSize;
	}

	return all;
};

export type { CargoQueryParams, CargoRow };
export { cargoQueryAll };
