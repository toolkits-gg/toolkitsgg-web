/**
 * Whether the sign-in claim prompt should be shown, and whether it has already
 * been declined for the current session.
 *
 * Two storages on purpose. The preference is a standing choice, so it lives in
 * localStorage next to the anon ID and survives everything until the user
 * reverses it. The snooze only has to outlive a page reload, so sessionStorage
 * gives "not now" the lifetime a user expects without turning it into a
 * permanent decline.
 */

/** localStorage key: "toolkitsgg.anonClaimPrompt" */
const PROMPT_KEY = "toolkitsgg.anonClaimPrompt";
/** sessionStorage key: "toolkitsgg.anonClaimSnooze" */
const SNOOZE_KEY = "toolkitsgg.anonClaimSnooze";

const DISABLED = "off";

const isClaimPromptEnabled = (): boolean => {
	if (typeof window === "undefined") return false;
	return window.localStorage.getItem(PROMPT_KEY) !== DISABLED;
};

const setClaimPromptEnabled = (enabled: boolean): void => {
	if (typeof window === "undefined") return;
	if (enabled) {
		window.localStorage.removeItem(PROMPT_KEY);
		return;
	}
	window.localStorage.setItem(PROMPT_KEY, DISABLED);
};

/**
 * The snooze stores the user ID it was set for so that signing out and back in
 * as someone else still prompts, even though sessionStorage has not cleared.
 */
const isClaimSnoozed = (userId: string): boolean => {
	if (typeof window === "undefined") return false;
	return window.sessionStorage.getItem(SNOOZE_KEY) === userId;
};

const snoozeClaim = (userId: string): void => {
	if (typeof window === "undefined") return;
	window.sessionStorage.setItem(SNOOZE_KEY, userId);
};

const clearClaimSnooze = (): void => {
	if (typeof window === "undefined") return;
	window.sessionStorage.removeItem(SNOOZE_KEY);
};

export {
	clearClaimSnooze,
	isClaimPromptEnabled,
	isClaimSnoozed,
	setClaimPromptEnabled,
	snoozeClaim,
};
