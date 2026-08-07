import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { BuildVisibility } from "@/prisma";

export type CollectItemInput = { itemId: string; itemName: string };

export type CollectedItemRecord = {
	userId: string;
	itemId: string;
	updatedAt?: Date | string | null;
};

/** The mutable fields a user can edit on a build. */
export type BuildWriteFields = {
	name?: string;
	description?: string | null;
	visibility?: BuildVisibility;
	videoUrl?: string | null;
	imageUrl?: string | null;
	thumbnailUrl?: string | null;
	referenceUrl?: string | null;
	gameVersion?: string | null;
};

/** Lightweight row for build lists (profile tabs, cards). */
export type CreatedBuildSummary = {
	id: string;
	name: string;
	createdById: string | null;
	visibility: BuildVisibility;
	imageUrl?: string | null;
	thumbnailUrl?: string | null;
	createdAt?: Date | string | null;
	updatedAt?: Date | string | null;
};

/**
 * Full build record returned by the byId read. Game-specific relations
 * (e.g. Remnant2BuildItem[]) are intentionally excluded from this shared type;
 * each game can widen its own server-fn return when the build/edit UI needs them.
 */
export type CreatedBuildRecord = CreatedBuildSummary & {
	description?: string | null;
	videoUrl?: string | null;
	referenceUrl?: string | null;
	gameVersion?: string | null;
};

/** Patch-style input for editing an existing build (all fields optional but `buildId`). */
export type UpdateBuildInput = {
	buildId: string;
	name?: string;
	description?: string | null;
	visibility?: BuildVisibility;
	videoUrl?: string | null;
	imageUrl?: string | null;
	thumbnailUrl?: string | null;
	referenceUrl?: string | null;
	gameVersion?: string | null;
};

export type DeleteBuildInput = { buildId: string };

/**
 * A game's collected-items data hooks. Passed to the generic ItemList page so it
 * stays game-agnostic while each game owns its own (duplicated) read/write hooks.
 */
export type GameCollectedItemsData = {
	/** The acting user's collected items (remote when authed+online, else local IDB). */
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

/** A game's created-builds data hooks (only games with a build table provide it). */
export type GameCreatedBuildsData = {
	/** The acting user's own builds. */
	useList: () => UseQueryResult<CreatedBuildSummary[]>;
	/** Another user's publicly-visible builds, by id (always remote). Disabled when null. */
	usePublicList: (
		userId: string | null,
	) => UseQueryResult<CreatedBuildSummary[]>;
	/** A single build by id (null when missing). */
	useById: (buildId: string) => UseQueryResult<CreatedBuildRecord | null>;
	useUpdate: () => UseMutationResult<
		CreatedBuildRecord,
		Error,
		UpdateBuildInput
	>;
	useRemove: () => UseMutationResult<{ ok: true }, Error, DeleteBuildInput>;
};
