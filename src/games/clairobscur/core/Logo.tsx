import { AppLogo } from "#/components/AppLogo";
import { DEFAULT_APP_LOGO_SIZE } from "#/constants.ts";
import { GAME_ID } from "#/games/clairobscur/core/constants";
import type { AppLogoSize } from "#/types.ts";

type Remnant2LogoProps = {
	size?: AppLogoSize;
};

const ClairObscurLogo = ({
	size = DEFAULT_APP_LOGO_SIZE,
}: Remnant2LogoProps) => {
	// Logo sizes don't go lower than 64
	// The image path needs a safe size
	const safeSize = size < 64 ? 64 : size;

	return <AppLogo path={`games/${GAME_ID}/logos/${safeSize}C33.png`} />;
};

export { ClairObscurLogo };
