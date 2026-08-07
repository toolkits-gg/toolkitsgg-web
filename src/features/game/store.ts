import { Store } from "@tanstack/store";
import type { GameId } from "@/prisma";

/**
 * Used to allow client-only updates via GameSwitcher toggles.
 * The primary gameId is in the `active-game` cookie,
 * exposed as `ssrGameId` via `useGameId`.
 */
interface GameState {
	gameId: GameId | null;
}

const gameStore = new Store<GameState>({ gameId: null });

const setGame = (id: GameId | null) => {
	gameStore.setState(() => ({ gameId: id }));
};

export { gameStore, setGame };
