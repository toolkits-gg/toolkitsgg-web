// Single source of truth for backend selection.
// All DAL hooks derive their backend from this function so the rule stays consistent.

import type { Backend } from "#/features/dal/types.ts";

interface DispatchInput {
	/** Whether the user has an active authenticated session. */
	authed: boolean;
	/** Whether the browser currently has network connectivity. */
	online: boolean;
}

/**
 * Returns "remote" only when BOTH authed and online are true.
 * Unauthenticated users always use "local" — they have no server identity to sync to.
 */
const chooseBackend = ({ authed, online }: DispatchInput): Backend => {
	return authed && online ? "remote" : "local";
};

export { chooseBackend };
