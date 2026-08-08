import {
	AppLogo,
	DEFAULT_APP_LOGO_SIZE,
	logoAssetSize,
} from "#/components/AppLogo";
import { GAME_ID } from "#/games/slaythespire2/core/constants";
import type { AppLogoSize } from "#/types";

type SlayTheSpire2LogoProps = {
	size?: AppLogoSize;
};

const SlayTheSpire2Logo = ({
	size = DEFAULT_APP_LOGO_SIZE,
}: SlayTheSpire2LogoProps) => {
	return (
		<AppLogo
			path={`games/${GAME_ID}/logos/${logoAssetSize(size)}STS2.png`}
			size={size}
		/>
	);
};

export { SlayTheSpire2Logo };
