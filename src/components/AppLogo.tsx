import { AppImage } from "#/components/AppImage";
import type { AppLogoSize } from "#/types";

type AppLogoProps = {
	path: string;
	size?: AppLogoSize;
};

/** Default app logo is to resize the 64px logo asset. No logo asset exists below 64px, so smaller requests reuse the 64 file. */
const DEFAULT_APP_LOGO_SIZE: AppLogoSize = 36;

/** Used for file path resolution itself. No logo asset exists below 64px, so smaller requests reuse the 64 file. */
const SMALLEST_LOGO_ASSET: AppLogoSize = 64;
const logoAssetSize = (size: AppLogoSize): AppLogoSize =>
	size < SMALLEST_LOGO_ASSET ? SMALLEST_LOGO_ASSET : size;

const AppLogo = ({ path, size = DEFAULT_APP_LOGO_SIZE }: AppLogoProps) => {
	return <AppImage src={path} w={size} h={size} alt="Logo of Toolkits.gg" />;
};

const DefaultLogo = ({
	size = DEFAULT_APP_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return <AppLogo path={`logos/LogoToxicGreen.png`} size={size} />;
};
const AnimatedLogo = ({
	size = DEFAULT_APP_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return (
		<AppLogo
			path={`logos/${size === 64 ? 64 : 128}GradientTK.gif`}
			size={size}
		/>
	);
};

export {
	AnimatedLogo,
	AppLogo,
	DEFAULT_APP_LOGO_SIZE,
	DefaultLogo,
	logoAssetSize,
};
