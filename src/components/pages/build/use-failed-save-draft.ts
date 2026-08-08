import { useCallback, useEffect, useState } from "react";
import type { BuildDetailsValue } from "#/components/pages/build/build-editor/BuildDetailsFields";
import type { BuildLoadoutEntry } from "#/features/game/data/types";
import type { GameId } from "@/prisma";

/**
 * Keeps an edit that failed to save on the device until it lands somewhere.
 *
 * Editing an existing build holds the only copy in component state, so a crash or a
 * closed tab after a failed save discards work the user cannot get back. Creating a
 * build needs none of this: that draft already lives in the query string.
 *
 * Written only on failure. Mirroring every keystroke would give each ordinary edit a
 * second copy that can drift from the server row, which is the divergence the
 * local-vs-remote split is meant to avoid.
 *
 * A recovered draft is never applied on its own. It is offered alongside the build's
 * `updatedAt` from when the edit was made, so a build that moved on elsewhere is a
 * visible choice rather than a silent overwrite.
 */

/** Drafts past this age are dropped on read, so abandoned edits don't accumulate. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type FailedSaveDraft = {
	details: BuildDetailsValue;
	loadout: BuildLoadoutEntry[];
	/** The build's updatedAt when the edit was made, or null when it was unknown. */
	baseUpdatedAt: string | null;
	savedAt: string;
};

const storageKey = (gameId: GameId, buildId: string) =>
	`toolkitsgg.buildDraft.${gameId}.${buildId}`;

/**
 * localStorage is user-writable and can hold a shape an older build wrote, so the
 * stored value is checked rather than trusted. Anything unrecognised reads as absent
 * and gets cleared, which costs at most a draft that was already unusable.
 */
const parseDraft = (raw: string): FailedSaveDraft | null => {
	try {
		const value: unknown = JSON.parse(raw);
		if (typeof value !== "object" || value === null) return null;
		const draft = value as Partial<FailedSaveDraft>;
		const detailsLookRight =
			typeof draft.details === "object" &&
			draft.details !== null &&
			typeof draft.details.name === "string";
		if (!detailsLookRight) return null;
		if (!Array.isArray(draft.loadout)) return null;
		if (typeof draft.savedAt !== "string") return null;
		if (!Number.isFinite(Date.parse(draft.savedAt))) return null;
		return {
			details: draft.details as BuildDetailsValue,
			loadout: draft.loadout as BuildLoadoutEntry[],
			baseUpdatedAt:
				typeof draft.baseUpdatedAt === "string" ? draft.baseUpdatedAt : null,
			savedAt: draft.savedAt,
		};
	} catch {
		return null;
	}
};

type FailedSaveDraftState = {
	/**
	 * A draft left behind by an earlier visit, or null. Read once after mount, so
	 * keeping a draft during this visit does not offer the user their own on-screen
	 * edits back.
	 */
	recovered: FailedSaveDraft | null;
	keep: (draft: Omit<FailedSaveDraft, "savedAt">) => void;
	discard: () => void;
};

const useFailedSaveDraft = (
	gameId: GameId,
	buildId: string | null,
): FailedSaveDraftState => {
	const [recovered, setRecovered] = useState<FailedSaveDraft | null>(null);
	const key = buildId ? storageKey(gameId, buildId) : null;

	// Read after mount rather than in a lazy initializer, so the server render and
	// the first client render agree and hydration stays quiet.
	useEffect(() => {
		if (!key) return;
		const raw = window.localStorage.getItem(key);
		const stored = raw ? parseDraft(raw) : null;
		if (!stored) {
			if (raw) window.localStorage.removeItem(key);
			return;
		}
		if (Date.now() - Date.parse(stored.savedAt) > MAX_AGE_MS) {
			window.localStorage.removeItem(key);
			return;
		}
		setRecovered(stored);
	}, [key]);

	const keep = useCallback(
		(draft: Omit<FailedSaveDraft, "savedAt">) => {
			if (!key) return;
			const next: FailedSaveDraft = {
				...draft,
				savedAt: new Date().toISOString(),
			};
			try {
				window.localStorage.setItem(key, JSON.stringify(next));
			} catch {
				// A full or blocked store must not turn a failed save into a crash; the
				// edit is still on screen and the navigation guard still covers it.
			}
		},
		[key],
	);

	const discard = useCallback(() => {
		if (key) window.localStorage.removeItem(key);
		setRecovered(null);
	}, [key]);

	return { recovered, keep, discard };
};

export { useFailedSaveDraft };
