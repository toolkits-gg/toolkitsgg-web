import type { ComponentType } from "react";
import type { AppLogoSize } from "#/types.ts";

type WatermarkGameConfig = {
	METADATA: {
		LogoComponent: ComponentType<{ size?: AppLogoSize }>;
		label: string;
	};
};

export type WatermarkConfig = {
	gameConfig: WatermarkGameConfig;
	logoSize?: AppLogoSize;
	fontSize?: string;
	gap?: number | string;
};
