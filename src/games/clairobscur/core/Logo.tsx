import {
	AppLogo,
	DEFAULT_APP_LOGO_SIZE,
	logoAssetSize,
} from "#/components/AppLogo";
import { GAME_ID } from "#/games/clairobscur/core/constants";
import type { AppLogoSize } from "#/types";

type Remnant2LogoProps = {
	size?: AppLogoSize;
};

const ClairObscurLogo = ({
	size = DEFAULT_APP_LOGO_SIZE,
}: Remnant2LogoProps) => {
	return (
		<AppLogo
			path={`games/${GAME_ID}/logos/${logoAssetSize(size)}C33.png`}
			size={size}
		/>
	);
};

export { ClairObscurLogo };
