const DISCORD_URL = "https://discord.gg/VQF23tPKyK";
const GITHUB_URL = "https://github.com/toolkits-gg";
const CHANGELOG_URL =
	"https://github.com/joshpayette/toolkits.gg/blob/main/CHANGELOG.md";
const PATREON_URL = "https://www.patreon.com/JoshPayette";
const PAYPAL_URL =
	"https://www.paypal.com/donate/?hosted_button_id=YGFSAQRH3CZGN";
const KOFI_URL = "https://ko-fi.com/remnant2toolkit";

const FALLBACK_DISPLAY_NAME = "Toolkits.gg User";

const OG_IMAGE = `${import.meta.env.VITE_CLOUDFRONT_URL}/metadata/og-image.png`;

const SERVER_GAME_INPUTS_QUERY_KEY = ["server-resolved-game-inputs"] as const;

export {
	CHANGELOG_URL,
	DISCORD_URL,
	FALLBACK_DISPLAY_NAME,
	GITHUB_URL,
	KOFI_URL,
	OG_IMAGE,
	PATREON_URL,
	PAYPAL_URL,
	SERVER_GAME_INPUTS_QUERY_KEY,
};
