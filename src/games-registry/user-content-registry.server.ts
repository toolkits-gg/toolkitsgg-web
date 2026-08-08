/**
 * Explicit games-registry of "hide everything this user published" handlers.
 *
 * A ban is site-wide, but the tables holding a user's content belong to each
 * game, so the generic ban path iterates this map instead of naming any of them.
 * Games with nothing publishable (no builds, no shared collections) are absent,
 * and absence is the opt-out.
 */

import type { HideUserContent } from "#/features/moderation/user-content.server";
import { hideAllPublicContentForUser as remnant2HideUserContent } from "#/games/remnant2/data/moderation/moderation.server";
import type { PublicRegistryGameId } from "#/games-registry/public-registry";

const USER_CONTENT_REGISTRY: Partial<
	Record<PublicRegistryGameId, HideUserContent>
> = {
	remnant2: remnant2HideUserContent,
};

const allUserContentHiders = (): HideUserContent[] =>
	Object.values(USER_CONTENT_REGISTRY);

export { allUserContentHiders };
