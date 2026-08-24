// For use by the wizard, appends statuses like `-completed` to it
const LOCALSTORAGE_KEY_PREFIX = "getting-started-wizard";

// Full keys for comparisons
const LOCALSTORAGE_KEYS = {
	HAS_COMPLETED: "getting-started-wizard-completed",
} as const;

export { LOCALSTORAGE_KEY_PREFIX, LOCALSTORAGE_KEYS };
