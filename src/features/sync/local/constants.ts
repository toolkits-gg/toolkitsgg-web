// IndexedDB object store name constants for the toolkitsgg-local database.

/** Stores user profile records (displayName, bio, avatar references). */
const STORE_USER_PROFILE = "userProfile";
/** Stores user ↔ game favorite relationships. */
const STORE_USER_FAVORITE_GAME = "userFavoriteGame";
/** Stores per-game avatar overrides chosen by the user. */
const STORE_USER_AVATAR_OVERRIDE = "userAvatarOverride";

export {
	STORE_USER_AVATAR_OVERRIDE,
	STORE_USER_FAVORITE_GAME,
	STORE_USER_PROFILE,
};
