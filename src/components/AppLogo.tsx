import { AppImage } from "#/components/AppImage";
import { DEFAULT_APP_LOGO_SIZE } from "#/constants.ts";
import type { AppLogoSize } from "#/types.ts";

type AppLogoProps = {
	path: string;
	size?: AppLogoSize;
};

export const AppLogo = ({
	path,
	size = DEFAULT_APP_LOGO_SIZE,
}: AppLogoProps) => {
	return <AppImage src={path} w={size} h={size} alt="Logo of Toolkits.gg" />;
};

export const CleanLogo = ({
	size = DEFAULT_APP_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return <AppLogo path={`logos/128Clean.png`} size={size} />;
};

export const DefaultLogo = ({
	size = DEFAULT_APP_LOGO_SIZE,
}: {
	size?: AppLogoProps["size"];
}) => {
	return <AppLogo path={`logos/LogoToxicGreen.png`} size={size} />;
};

export const AnimatedLogo = ({
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
