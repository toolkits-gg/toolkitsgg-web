import { Flex, Text } from "@mantine/core";
import type { ComponentType } from "react";
import { DEFAULT_APP_LOGO_SIZE } from "#/constants.ts";
import type { AppLogoSize } from "#/types.ts";

type ScreenshotWatermarkProps = {
	LogoComponent: ComponentType<{ size?: AppLogoSize }>;
	logoSize?: AppLogoSize;
	label: string;
	fontSize?: string;
	gap?: number | string;
};

const ScreenshotWatermark = ({
	LogoComponent,
	logoSize = DEFAULT_APP_LOGO_SIZE,
	label,
	fontSize = "md",
	gap = 2,
}: ScreenshotWatermarkProps) => {
	return (
		<Flex align="center" justify="center" w="100%" gap={gap} py={0} px="sm">
			<LogoComponent size={logoSize} />
			<Flex direction="column" gap={0}>
				<Text fz="lg" fw={700} c="accent" ff="heading" lh={1}>
					toolkits.gg
				</Text>
				{label !== "Default" && (
					<Text fz={fontSize} fw={600} lh={1} tt="uppercase" c="primary">
						{label}
					</Text>
				)}
			</Flex>
		</Flex>
	);
};

export { ScreenshotWatermark };
