// Remnant 2 build upvotes: client data hooks. Each hook inlines the backend
// choice (remote when signed in, else local IndexedDB) and, on the local
// path, mirrors the write to IDB and enqueues a pending op for later sync.
//
// Upvotes are the one entity whose local writes target rows the viewer does not
// own, so the write path has to mirror the build itself before the upvote row
// can reference it.

import { notifications } from "@mantine/notifications";
import {
	type QueryKey,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	BuildUpvoteInput,
	CreatedBuildRecord,
	CreatedBuildSummary,
	GameBuildUpvotesData,
} from "#/features/game/data/types";
import { toIso } from "#/features/game/data/utils";
import {
	remnant2BuildStore,
	remnant2BuildUpvoteStore,
} from "#/features/local-db/game-stores";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id";
import { enqueueOp } from "#/features/sync/queue/pending-ops";
import {
	hasUpvotedBuildServerFn,
	listUpvotedBuildsServerFn,
	removeBuildUpvoteServerFn,
	upvoteBuildServerFn,
} from "#/games/remnant2/data/build-upvotes/build-upvotes";
import { ensureLocalBuildStub } from "#/games/remnant2/data/local-build-stub";
import { useSession } from "#/integrations/better-auth/auth-client";

const ENTITY = "remnant2BuildUpvote";
const BUILD_ENTITY = "remnant2Build";

const hasUpvotedKey = (buildId: string, userId: string): QueryKey => [
	"data",
	ENTITY,
	"hasUpvoted",
	buildId,
	userId,
];

const buildRecordKey = (buildId: string): QueryKey => [
	"data",
	BUILD_ENTITY,
	"byId",
	buildId,
];

/** Pre-press cache values, kept so a failed write can put them back. */
type OptimisticUpvote = {
	upvotedKey: QueryKey;
	recordKey: QueryKey;
	upvoted: boolean | undefined;
	record: CreatedBuildRecord | null | undefined;
};

const usePublicLikedList = (publicUserId: string | null) =>
	useQuery({
		queryKey: ["data", ENTITY, "list", "byUserId", publicUserId],
		queryFn: (): Promise<CreatedBuildSummary[]> =>
			publicUserId
				? listUpvotedBuildsServerFn({ data: { userId: publicUserId } })
				: Promise.resolve([]),
		enabled: !!publicUserId,
	});

const useLikedList = () => {
	const { data: session } = useSession();
	const authUserId = session?.user?.id ?? null;
	const userId = authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId;

	return useQuery({
		queryKey: ["data", ENTITY, "list", userId],
		queryFn: async (): Promise<CreatedBuildSummary[]> => {
			if (remote) return listUpvotedBuildsServerFn({ data: { userId } });
			const rows = await remnant2BuildUpvoteStore.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
			});
			// Read in upvote order, so the newest like reads first.
			const builds = await Promise.all(
				rows.map((row) =>
					remnant2BuildStore.findUnique({ where: { id: row.buildId } }),
				),
			);
			return builds.filter(
				(build): build is NonNullable<typeof build> => !!build,
			);
		},
	});
};

const useHasUpvoted = (buildId: string) => {
	const { data: session } = useSession();
	const authUserId = session?.user?.id ?? null;
	const userId = authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId;

	return useQuery({
		queryKey: hasUpvotedKey(buildId, userId),
		queryFn: async (): Promise<boolean> => {
			if (remote) return hasUpvotedBuildServerFn({ data: { buildId } });
			const row = await remnant2BuildUpvoteStore.findUnique({
				where: { buildId, userId },
			});
			return !!row;
		},
		enabled: !!buildId,
	});
};

/**
 * Writes the toggled state into the cache up front so the press feels immediate
 * rather than waiting on the server round trip, which the refetch that follows
 * then agrees with, so the number doesn't visibly settle twice.
 *
 * `countsPublicly` is false for a signed-out press. That upvote lives in
 * IndexedDB until the visitor signs in and the queue drains, so the build's
 * public total genuinely hasn't moved yet; bumping it here would only be undone
 * by the refetch. The filled heart is that press's feedback instead.
 */
const applyOptimisticUpvote = (
	queryClient: ReturnType<typeof useQueryClient>,
	buildId: string,
	userId: string,
	upvoted: boolean,
	countsPublicly: boolean,
): OptimisticUpvote => {
	const upvotedKey = hasUpvotedKey(buildId, userId);
	const recordKey = buildRecordKey(buildId);
	const snapshot: OptimisticUpvote = {
		upvotedKey,
		recordKey,
		upvoted: queryClient.getQueryData<boolean>(upvotedKey),
		record: queryClient.getQueryData<CreatedBuildRecord | null>(recordKey),
	};

	// A press that agrees with the state already on screen leaves the count
	// alone, matching the server's own no-op on a repeated upvote.
	const alreadyThere =
		(snapshot.record?.upvotedByViewer ?? snapshot.upvoted) === upvoted;
	const moves = countsPublicly && !alreadyThere;
	const delta = moves ? (upvoted ? 1 : -1) : 0;

	queryClient.setQueryData(upvotedKey, upvoted);
	queryClient.setQueryData<CreatedBuildRecord | null>(recordKey, (record) =>
		record
			? {
					...record,
					upvoteCount: Math.max(0, (record.upvoteCount ?? 0) + delta),
					upvotedByViewer: upvoted,
				}
			: record,
	);
	return snapshot;
};

const rollbackOptimisticUpvote = (
	queryClient: ReturnType<typeof useQueryClient>,
	snapshot: OptimisticUpvote,
): void => {
	// setQueryData discards an undefined value, so a key that held nothing before
	// the press has to be cleared rather than written back. The record key needs
	// no such handling: the optimistic write skips a key with nothing in it.
	if (snapshot.upvoted === undefined) {
		queryClient.removeQueries({ queryKey: snapshot.upvotedKey, exact: true });
	} else {
		queryClient.setQueryData(snapshot.upvotedKey, snapshot.upvoted);
	}
	queryClient.setQueryData(snapshot.recordKey, snapshot.record);
};

const useUpvoteMutation = (mode: "add" | "remove") => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, BuildUpvoteInput, OptimisticUpvote>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const wire = { buildId: input.buildId };
			if (authUserId) {
				return mode === "add"
					? upvoteBuildServerFn({ data: wire })
					: removeBuildUpvoteServerFn({ data: wire });
			}

			await ensureLocalBuildStub(input.build);
			const where = { buildId: input.buildId, userId: anonUserId };
			const existing = await remnant2BuildUpvoteStore.findUnique({ where });

			if (mode === "add") {
				if (!existing) await remnant2BuildUpvoteStore.create({ data: where });
			} else {
				await remnant2BuildUpvoteStore.deleteMany({ where });
			}

			await enqueueOp({
				anonUserId,
				entity: ENTITY,
				operation: mode === "add" ? "upsert" : "delete",
				payload: wire,
				// Stable: an upvote is presence-only, so replaying is idempotent.
				idempotencyKey: `${ENTITY}:${mode}:${anonUserId}:${input.buildId}`,
				serverUpdatedAt: toIso(existing?.updatedAt),
				summary: {
					title: mode === "add" ? "Upvoted build" : "Removed build upvote",
					gameId: "remnant2",
				},
			});
			return { ok: true as const };
		},
		onMutate: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const userId = authUserId ?? getOrCreateAnonUserId();
			const upvoted = mode === "add";
			// Cancelled so an in-flight read can't land after the write and
			// overwrite the optimistic value with the pre-press state.
			await Promise.all([
				queryClient.cancelQueries({
					queryKey: hasUpvotedKey(input.buildId, userId),
				}),
				queryClient.cancelQueries({ queryKey: buildRecordKey(input.buildId) }),
			]);
			return applyOptimisticUpvote(
				queryClient,
				input.buildId,
				userId,
				upvoted,
				!!authUserId,
			);
		},
		onError: (error, _input, snapshot) => {
			if (snapshot) rollbackOptimisticUpvote(queryClient, snapshot);
			notifications.show({
				title: "Couldn't update upvote",
				message: error.message,
				color: "red",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] });
			queryClient.invalidateQueries({ queryKey: ["data", BUILD_ENTITY] });
		},
	});
};

const useUpvote = () => useUpvoteMutation("add");
const useRemoveUpvote = () => useUpvoteMutation("remove");

const remnant2BuildUpvotesData: GameBuildUpvotesData = {
	useUpvote,
	useRemoveUpvote,
	useLikedList,
	usePublicLikedList,
	useHasUpvoted,
};

export { remnant2BuildUpvotesData };
