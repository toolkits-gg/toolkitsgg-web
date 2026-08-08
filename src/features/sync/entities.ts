/**
 * The entities a queued op may name.
 *
 * This list is the join between two halves that no type previously connected: the
 * client hooks that call `enqueueOp` and the server-only handler games-registry that
 * applies the op. An entity present in one and missing from the other produced an op
 * that could never land - `applyPendingOpServerFn` returns "no sync handler", the op
 * retries forever, and nothing failed until a user noticed their data had not moved.
 *
 * Kept free of server imports so both halves can reference it. `PendingOp.entity` and
 * `syncHandlers` are both keyed on it, so adding a hook without its handler, or
 * misspelling either, is a type error rather than a runtime dead end.
 */

const SYNCABLE_ENTITIES = [
	"remnant2CollectedItem",
	"clairObscurCollectedItem",
	"slayTheSpire2CollectedItem",
	"remnant2Build",
	"remnant2BuildDuplicate",
	"remnant2BuildCollection",
	"remnant2BuildOnCollection",
	"remnant2BuildUpvote",
	"userFavoriteGame",
	"userProfile",
	"userPrimaryAvatar",
	"userAvatarOverride",
	"userPrimaryHeaderImage",
	"userHeaderImageOverride",
] as const;

type SyncableEntity = (typeof SYNCABLE_ENTITIES)[number];

export type { SyncableEntity };
export { SYNCABLE_ENTITIES };
