import {
	AppLogo,
	DEFAULT_LOGO_SIZE,
	type LogoSize,
} from "#/components/AppLogo";
import { GAME_ID } from "#/games/slaythespire2/core/constants";

type SlayTheSpire2LogoProps = {
	size?: LogoSize;
};

const SlayTheSpire2Logo = ({
	size = DEFAULT_LOGO_SIZE,
}: SlayTheSpire2LogoProps) => {
	// Logo sizes don't go lower than 64
	// The image path needs a safe size
	const safeSize = size < 64 ? 64 : size;

	return <AppLogo path={`games/${GAME_ID}/logos/${safeSize}STS2.png`} />;
};

export { SlayTheSpire2Logo };
