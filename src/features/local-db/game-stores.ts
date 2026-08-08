/**
 * The local stores for game data, the browser-side half of the local-first
 * write path.
 *
 * Each `defaults` block mirrors that model's `@default(...)` values and its
 * nullable columns, so a row created here carries the same field set the server
 * would have written and a create only has to name the fields a caller actually
 * chooses. Nothing enforces relations: an orphaned row is the sync queue's
 * problem to reconcile, not IndexedDB's to prevent.
 */

import { createStore } from "#/features/local-db/idb-store";

const remnant2BuildStore = createStore({
	name: "remnant2Build",
	keyPath: "id",
	indexes: ["createdById", "variantCollectionId"],
	defaults: {
		createdById: null,
		description: null,
		visibility: "PUBLIC",
		moderatorStatus: "PENDING",
		lastReviewedSnapshot: null,
		videoUrl: null,
		imageUrl: null,
		imagePositionX: 0.5,
		imagePositionY: 0.5,
		imageFit: "cover",
		thumbnailUrl: null,
		referenceUrl: null,
		gameVersion: null,
		itemCount: 0,
		collectionCount: 0,
		duplicateCount: 0,
		upvoteCount: 0,
		viewCount: 0,
		validatedViewCount: 0,
		variantCollectionId: null,
	},
});

const remnant2BuildItemStore = createStore({
	name: "remnant2BuildItem",
	keyPath: ["buildId", "itemId"],
	indexes: ["buildId"],
	defaults: { level: 1, amount: null, optional: false },
});

const remnant2BuildTagStore = createStore({
	name: "remnant2BuildTag",
	keyPath: ["buildId", "tag"],
	indexes: ["buildId"],
});

const remnant2BuildCollectionStore = createStore({
	name: "remnant2BuildCollection",
	keyPath: "id",
	indexes: ["createdById"],
	defaults: {
		description: null,
		visibility: "PUBLIC",
		moderatorStatus: "PENDING",
		displayMode: "CARDS",
	},
});

const remnant2BuildsOnCollectionsStore = createStore({
	name: "remnant2BuildsOnCollections",
	keyPath: ["collectionId", "buildId"],
	indexes: ["collectionId", "buildId"],
	defaults: { position: 0 },
});

const remnant2BuildUpvoteStore = createStore({
	name: "remnant2BuildUpvote",
	keyPath: ["buildId", "userId"],
	indexes: ["userId", "buildId"],
});

const remnant2CollectedItemStore = createStore({
	name: "remnant2CollectedItem",
	keyPath: ["userId", "itemId"],
	indexes: ["userId"],
});

const clairObscurCollectedItemStore = createStore({
	name: "clairObscurCollectedItem",
	keyPath: ["userId", "itemId"],
	indexes: ["userId"],
});

const slayTheSpire2CollectedItemStore = createStore({
	name: "slayTheSpire2CollectedItem",
	keyPath: ["userId", "itemId"],
	indexes: ["userId"],
});

export {
	clairObscurCollectedItemStore,
	remnant2BuildCollectionStore,
	remnant2BuildItemStore,
	remnant2BuildStore,
	remnant2BuildsOnCollectionsStore,
	remnant2BuildTagStore,
	remnant2BuildUpvoteStore,
	remnant2CollectedItemStore,
	slayTheSpire2CollectedItemStore,
};
