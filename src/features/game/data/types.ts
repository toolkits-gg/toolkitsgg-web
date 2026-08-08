import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { ImageFit } from "#/features/image-position/image-fit";
import type { FieldDiff } from "#/features/moderation/review-diff";
import type { BuildCollectionDisplayMode, BuildVisibility } from "@/prisma";

export type CollectItemInput = { itemId: string; itemName: string };

export type CollectedItemRecord = {
	userId: string;
	itemId: string;
	updatedAt?: Date | string | null;
};

/**
 * One item slotted into a build. Deliberately the column set of a build/item
 * join row, so it stays a generic shape any game with a build table can adopt
 * without the app-level editor knowing what an "item" means for that game.
 */
export type BuildLoadoutEntry = {
	itemId: string;
	level?: number;
	amount?: number | null;
	optional?: boolean;
};

/** The mutable scalar fields a user can edit on a build. */
export type BuildWriteFields = {
	name?: string;
	description?: string | null;
	visibility?: BuildVisibility;
	videoUrl?: string | null;
	imageUrl?: string | null;
	/** Focal point of `imageUrl` on a build card, 0-1 per axis. Cropped fits only. */
	imagePositionX?: number;
	imagePositionY?: number;
	imageFit?: ImageFit;
	thumbnailUrl?: string | null;
	referenceUrl?: string | null;
	gameVersion?: string | null;
};

/** The relation-backed fields a user can edit on a build, written separately. */
export type BuildRelationFields = {
	loadout?: BuildLoadoutEntry[];
	tags?: string[];
};

/**
 * The variant set a build belongs to, as seen by a particular viewer. Absent
 * when the build is standalone or when the viewer may not see the set, so a
 * build inside someone else's private set still reads as an ordinary build.
 */
export type BuildVariantSetRef = {
	collectionId: string;
	name: string;
	variantCount: number;
	/** The set's position-0 member, which is what a collapsed listing shows. */
	isPrimary: boolean;
};

/** Lightweight row for build lists (profile tabs, cards, feeds). */
export type CreatedBuildSummary = {
	id: string;
	name: string;
	createdById: string | null;
	visibility: BuildVisibility;
	imageUrl?: string | null;
	imagePositionX?: number | null;
	imagePositionY?: number | null;
	/** Narrow with `toImageFit`; the column is a plain string. */
	imageFit?: string | null;
	thumbnailUrl?: string | null;
	upvoteCount?: number;
	createdAt?: Date | string | null;
	updatedAt?: Date | string | null;
	variantSet?: BuildVariantSetRef | null;
};

/**
 * Full build record returned by the byId read. `loadout` is the game-agnostic
 * projection of whatever join table the game uses, so the shared editor can
 * round-trip a build without knowing the game's item model.
 */
export type CreatedBuildRecord = CreatedBuildSummary & {
	description?: string | null;
	videoUrl?: string | null;
	referenceUrl?: string | null;
	gameVersion?: string | null;
	loadout: BuildLoadoutEntry[];
	tags: string[];
	viewCount?: number;
	upvotedByViewer?: boolean;
};

/**
 * Input for creating a build. `buildId` is minted client-side so the local
 * write and the queued op that later replays it agree on the row's identity.
 */
export type CreateBuildInput = BuildWriteFields &
	BuildRelationFields & {
		buildId: string;
		name: string;
	};

/** Patch-style input for editing an existing build (all fields optional but `buildId`). */
export type UpdateBuildInput = BuildWriteFields &
	BuildRelationFields & { buildId: string };

export type DeleteBuildInput = { buildId: string };

/**
 * Copies a build into a variant set. `newBuildId` is minted client-side for the
 * same reason `CreateBuildInput.buildId` is: the local write and the queued op
 * that replays it must agree on the copy's identity.
 */
export type DuplicateBuildInput = {
	sourceBuildId: string;
	newBuildId: string;
	collectionId: string;
};

export type BuildViewInput = { buildId: string; viewerKey: string };

/** Lightweight row for collection lists (profile tabs, add-to-collection menu). */
export type BuildCollectionSummary = {
	id: string;
	name: string;
	description?: string | null;
	visibility: BuildVisibility;
	/**
	 * How the collection renders for everyone, not just its owner: VARIANTS swaps
	 * the card grid for the read-only builder plus a switcher, for collections
	 * whose builds are versions of one another.
	 */
	displayMode: BuildCollectionDisplayMode;
	createdById: string;
	buildCount: number;
	createdAt?: Date | string | null;
	updatedAt?: Date | string | null;
};

/** A collection plus its ordered builds, for the collection detail page. */
export type BuildCollectionRecord = BuildCollectionSummary & {
	builds: CreatedBuildSummary[];
};

export type CreateBuildCollectionInput = {
	collectionId: string;
	name: string;
	description?: string | null;
	visibility?: BuildVisibility;
	displayMode?: BuildCollectionDisplayMode;
};

export type UpdateBuildCollectionInput = {
	collectionId: string;
	name?: string;
	description?: string | null;
	visibility?: BuildVisibility;
	displayMode?: BuildCollectionDisplayMode;
};

export type DeleteBuildCollectionInput = { collectionId: string };

/**
 * `build` carries the summary the caller already has on screen, for the same
 * reason `BuildUpvoteInput` does: a collection can hold builds the viewer does
 * not own, and the local path has to mirror the build into IndexedDB before
 * writing a membership row that FKs to it. The remote path ignores it.
 */
export type CollectionMembershipInput = {
	collectionId: string;
	buildId: string;
	build: CreatedBuildSummary;
};

/** The collection's members in their new order. Ids not in the collection are ignored. */
export type SetCollectionBuildOrderInput = {
	collectionId: string;
	buildIds: string[];
};

/**
 * `build` carries the summary the caller already has on screen. The local path
 * needs it to mirror the build locally before writing a row that FKs to it - an
 * anonymous user upvotes builds they don't own, which are otherwise absent from
 * IndexedDB. The remote path ignores it.
 */
export type BuildUpvoteInput = {
	buildId: string;
	build: CreatedBuildSummary;
};

export type BuildFeedSort = "recent" | "popular";

/**
 * A game's collected-items data hooks. Passed to the generic ItemList page so it
 * stays game-agnostic while each game owns its own (duplicated) read/write hooks.
 */
export type GameCollectedItemsData = {
	/** The acting user's collected items (remote when signed in, else local IDB). */
	useList: () => UseQueryResult<CollectedItemRecord[]>;
	/** Another user's collected items, by id (always remote). Disabled when null. */
	usePublicList: (
		userId: string | null,
	) => UseQueryResult<CollectedItemRecord[]>;
	useCollect: () => UseMutationResult<
		CollectedItemRecord,
		Error,
		CollectItemInput
	>;
	useUncollect: () => UseMutationResult<{ ok: true }, Error, CollectItemInput>;
};

/** A game's created-builds data hooks. */
export type GameCreatedBuildsData = {
	/** The acting user's own builds. */
	useList: () => UseQueryResult<CreatedBuildSummary[]>;
	/** Another user's publicly-visible builds, by id (always remote). Disabled when null. */
	usePublicList: (
		userId: string | null,
	) => UseQueryResult<CreatedBuildSummary[]>;
	/** A single build by id (null when missing or not visible to the viewer). */
	useById: (buildId: string) => UseQueryResult<CreatedBuildRecord | null>;
	useCreate: () => UseMutationResult<
		CreatedBuildRecord,
		Error,
		CreateBuildInput
	>;
	useUpdate: () => UseMutationResult<
		CreatedBuildRecord,
		Error,
		UpdateBuildInput
	>;
	useRemove: () => UseMutationResult<{ ok: true }, Error, DeleteBuildInput>;
	/** Copies a build into a variant set and returns the copy. */
	useDuplicate: () => UseMutationResult<
		CreatedBuildRecord,
		Error,
		DuplicateBuildInput
	>;
	/** Records a deduped view. Fire-and-forget; failures are ignored. */
	useRecordView: () => UseMutationResult<{ ok: true }, Error, BuildViewInput>;
};

/** A game's build-collection data hooks. */
export type GameBuildCollectionsData = {
	/** The acting user's own collections. */
	useList: () => UseQueryResult<BuildCollectionSummary[]>;
	/** Another user's publicly-visible collections. Disabled when null. */
	usePublicList: (
		userId: string | null,
	) => UseQueryResult<BuildCollectionSummary[]>;
	/** A single collection with its builds (null when missing or not visible). */
	useById: (
		collectionId: string,
	) => UseQueryResult<BuildCollectionRecord | null>;
	useCreate: () => UseMutationResult<
		BuildCollectionSummary,
		Error,
		CreateBuildCollectionInput
	>;
	useUpdate: () => UseMutationResult<
		BuildCollectionSummary,
		Error,
		UpdateBuildCollectionInput
	>;
	useRemove: () => UseMutationResult<
		{ ok: true },
		Error,
		DeleteBuildCollectionInput
	>;
	useAddBuild: () => UseMutationResult<
		{ ok: true },
		Error,
		CollectionMembershipInput
	>;
	useRemoveBuild: () => UseMutationResult<
		{ ok: true },
		Error,
		CollectionMembershipInput
	>;
	/** Rewrites member positions to match the given order. */
	useSetBuildOrder: () => UseMutationResult<
		{ ok: true },
		Error,
		SetCollectionBuildOrderInput
	>;
	/** Ids of the acting user's collections containing a build, for the add-to-collection menu. */
	useCollectionIdsForBuild: (buildId: string) => UseQueryResult<string[]>;
};

/** A game's build-upvote data hooks. */
export type GameBuildUpvotesData = {
	useUpvote: () => UseMutationResult<{ ok: true }, Error, BuildUpvoteInput>;
	useRemoveUpvote: () => UseMutationResult<
		{ ok: true },
		Error,
		BuildUpvoteInput
	>;
	/**
	 * Builds the acting user has upvoted. Reads IndexedDB when signed out, so a
	 * visitor's likes survive without an account.
	 */
	useLikedList: () => UseQueryResult<CreatedBuildSummary[]>;
	/** Builds another user has upvoted, for their public profile. Remote-only. */
	usePublicLikedList: (
		userId: string | null,
	) => UseQueryResult<CreatedBuildSummary[]>;
	/** Whether the acting user has upvoted a build. */
	useHasUpvoted: (buildId: string) => UseQueryResult<boolean>;
};

/**
 * A game's feed reads. Remote-only: feeds are server-curated.
 *
 * `feed` is a curated feed name or `COMMUNITY_FEED`.
 */
export type GameBuildFeedsData = {
	useFeed: (
		feed: string,
		sort: BuildFeedSort,
	) => UseQueryResult<CreatedBuildSummary[]>;
};

/**
 * One card of moderator work: what changed, on what, by whom.
 *
 * Open rows for the same build arrive as one card, so a burst of edits is one
 * piece of work. Resolved and dismissed rows are separate review cycles and stay
 * apart. The diff is computed server-side and only the changed runs travel, so a
 * 5k description never reaches the browser.
 */
export type ModerationReviewRow = {
	/** The newest row in the group. */
	id: string;
	/** Earliest filing in the group. */
	createdAt: Date | string;
	/** Newest edit in the group. */
	updatedAt: Date | string;
	gameId: string;
	targetId: string;
	reason: string;
	status: string;
	changedFields: string[];
	fieldDiffs: FieldDiff[];
	/** Title fallback for a build that has since been deleted. */
	currentName: string | null;
	currentVideoUrl: string | null;
	author: { id: string; username: string; displayName: string | null } | null;
	build: {
		id: string;
		name: string;
		visibility: BuildVisibility;
		moderatorStatus: string;
	} | null;
};

export type ModerationAuditRow = {
	id: string;
	createdAt: Date | string;
	gameId: string;
	action: string;
	targetType: string;
	targetId: string;
	previousValue: string | null;
	newValue: string | null;
	reason: string | null;
	actor: { id: string; username: string } | null;
};

/** The action a moderator takes to close out a review item. */
export type ModerationResolution =
	| "APPROVE"
	| "DISMISS"
	| "SET_PRIVATE"
	| "LOCK"
	| "UNLOCK"
	| "DELETE";

/**
 * A game's moderation surface.
 * Optional on GameBuildsData: absence is the opt-out,
 * exactly as it is for builds themselves.
 */
export type GameBuildModerationData = {
	useReviewQueue: (args: {
		status: string;
	}) => UseQueryResult<ModerationReviewRow[]>;
	useOpenReviewCount: () => UseQueryResult<number>;
	useAuditLog: (args: {
		targetId?: string;
	}) => UseQueryResult<ModerationAuditRow[]>;
	useModerateContent: () => UseMutationResult<
		{ ok: true },
		Error,
		{
			buildId: string;
			clearVideo?: boolean;
			clearDescription?: boolean;
			reason?: string;
		}
	>;
	useSetFeedMembership: () => UseMutationResult<
		{ ok: true },
		Error,
		{ buildId: string; feed: string; member: boolean }
	>;
	useBuildAction: () => UseMutationResult<
		{ ok: true },
		Error,
		{ buildId: string; action: ModerationResolution; reason?: string }
	>;
	/** Edits a build the caller does not own. Files no review item. */
	useModeratorUpdate: () => UseMutationResult<
		{ ok: true },
		Error,
		{
			buildId: string;
			name?: string;
			description?: string | null;
			videoUrl?: string | null;
			referenceUrl?: string | null;
			reason?: string;
		}
	>;
};

/** Every data hook the app-level build feature needs from a game. */
export type GameBuildsData = {
	builds: GameCreatedBuildsData;
	collections: GameBuildCollectionsData;
	upvotes: GameBuildUpvotesData;
	feeds: GameBuildFeedsData;
	moderation?: GameBuildModerationData;
};
