import {
	AppLogo,
	DEFAULT_APP_LOGO_SIZE,
	logoAssetSize,
} from "#/components/AppLogo";
import { GAME_ID } from "#/games/remnant2/core/constants";
import type { AppLogoSize } from "#/types";

type Remnant2LogoProps = {
	size?: AppLogoSize;
};

const Remnant2Logo = ({ size = DEFAULT_APP_LOGO_SIZE }: Remnant2LogoProps) => {
	return (
		<AppLogo
			path={`games/${GAME_ID}/logos/${logoAssetSize(size)}R2.png`}
			size={size}
		/>
	);
};

export { Remnant2Logo };
