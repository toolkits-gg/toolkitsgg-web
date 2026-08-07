import { clientEnv } from "#/env/client-env.ts";
import type { AppLogoSize } from "#/types.ts";

const DISCORD_URL = "https://discord.gg/VQF23tPKyK";
const CODEBERG_URL = "https://codeberg.org/toolkitsgg";
const CHANGELOG_URL =
	"https://github.com/joshpayette/toolkits.gg/blob/main/CHANGELOG.md";
const PATREON_URL = "https://www.patreon.com/JoshPayette";
const PAYPAL_URL =
	"https://www.paypal.com/donate/?hosted_button_id=YGFSAQRH3CZGN";
const KOFI_URL = "https://ko-fi.com/remnant2toolkit";

const FALLBACK_DISPLAY_NAME = "Toolkits.gg User";

/**
 * Lives here rather than alongside the subdomain rewrite so that server-only
 * modules can read it without pulling in the game registry,
 * which violates the client/server boundary on dev.
 */
const APP_DOMAIN = "toolkits.gg";

const OG_IMAGE = `${clientEnv.VITE_CLOUDFRONT_URL}/metadata/og-image.png`;

const SERVER_RESOLVED_GAME_ID_SOURCES = [
	"server-resolved-game-id-sources",
] as const;

export const DEFAULT_APP_LOGO_SIZE: AppLogoSize = 36;

export {
	APP_DOMAIN,
	CHANGELOG_URL,
	CODEBERG_URL,
	DISCORD_URL,
	FALLBACK_DISPLAY_NAME,
	KOFI_URL,
	OG_IMAGE,
	PATREON_URL,
	PAYPAL_URL,
	SERVER_RESOLVED_GAME_ID_SOURCES,
};
