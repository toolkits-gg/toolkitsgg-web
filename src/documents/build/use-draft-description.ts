import { useCallback, useEffect, useRef, useState } from "react";
import type { GameId } from "@/prisma";

/**
 * Keeps an unsaved build description on the device.
 *
 * The description is the one editor field that doesn't ride in the share URL
 * (it is headed for 5k characters of markdown, which no share link can carry),
 * so it needs somewhere to survive a refresh. Everything else is already
 * refresh-safe by virtue of living in the query string.
 */

const WRITE_DELAY_MS = 500;

const storageKey = (gameId: GameId) =>
	`toolkitsgg.buildDraft.${gameId}.description`;

type DraftDescription = {
	value: string;
	set: (next: string) => void;
	clear: () => void;
};

const useDraftDescription = (
	gameId: GameId,
	enabled: boolean,
): DraftDescription => {
	const [value, setValue] = useState("");
	const key = storageKey(gameId);

	// Read after mount rather than in a lazy initializer, so the server render
	// and the first client render agree and hydration stays quiet.
	const hydratedRef = useRef(false);
	useEffect(() => {
		if (!enabled) return;
		const stored = window.localStorage.getItem(key);
		if (stored) setValue(stored);
		hydratedRef.current = true;
	}, [enabled, key]);

	useEffect(() => {
		if (!enabled || !hydratedRef.current) return;
		const timer = setTimeout(() => {
			if (value === "") window.localStorage.removeItem(key);
			else window.localStorage.setItem(key, value);
		}, WRITE_DELAY_MS);
		return () => clearTimeout(timer);
	}, [enabled, key, value]);

	const clear = useCallback(() => {
		setValue("");
		if (typeof window !== "undefined") window.localStorage.removeItem(key);
	}, [key]);

	return { value, set: setValue, clear };
};

export { useDraftDescription };
