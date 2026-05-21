import { Avatar, Box, type BoxProps, Group, Stack, Text } from "@mantine/core";
import cx from "clsx";
import { type ComponentType, forwardRef, type PropsWithChildren } from "react";
import type { LogoSize } from "#/components/AppLogo";
import { ScreenshotWatermark } from "#/features/screenshot/core/ScreenshotWatermark";
import classes from "./ScreenshotContainer.module.css";

type WatermarkGameConfig = {
	METADATA: {
		LogoComponent: ComponentType<{ size?: LogoSize }>;
		label: string;
	};
};

type WatermarkConfig = {
	gameConfig: WatermarkGameConfig;
	logoSize?: LogoSize;
	fontSize?: string;
	gap?: number | string;
};

type ScreenshotContainerProps = PropsWithChildren<
	{
		screenshotMode: boolean;
		watermark?: WatermarkConfig | false;
		title?: string;
		subtitle?: string;
		avatarUrl?: string;
		className?: string;
	} & Omit<BoxProps, "className">
>;

const ScreenshotContainer = forwardRef<
	HTMLDivElement,
	ScreenshotContainerProps
>(
	(
		{
			children,
			screenshotMode,
			watermark,
			title,
			subtitle,
			avatarUrl,
			className,
			...boxProps
		},
		ref,
	) => {
		const showWatermark = screenshotMode && watermark !== false && watermark;

		return (
			<Box
				ref={ref}
				p={screenshotMode ? "md" : undefined}
				className={cx(className, {
					[classes.screenshotContainer]: screenshotMode,
				})}
				{...boxProps}
			>
				{avatarUrl && title ? (
					<Group justify="center" align="center" mb="md" wrap="nowrap">
						<Avatar src={avatarUrl} size={64} radius="sm" alt="User avatar" />
						<Stack gap={2}>
							<Text fz="xl" fw={700}>
								{title}
							</Text>
							{subtitle && (
								<Text fz="sm" c="dimmed">
									{subtitle}
								</Text>
							)}
						</Stack>
					</Group>
				) : (
					<>
						{title && (
							<Text fz="xl" fw={700} ta="center" mb={subtitle ? "xs" : "md"}>
								{title}
							</Text>
						)}
						{subtitle && (
							<Text fz="sm" c="dimmed" ta="center" mb="md">
								{subtitle}
							</Text>
						)}
					</>
				)}
				{children}
				{showWatermark && (
					<Box mt="md">
						<ScreenshotWatermark
							LogoComponent={watermark.gameConfig.METADATA.LogoComponent}
							label={watermark.gameConfig.METADATA.label}
							logoSize={watermark.logoSize}
							fontSize={watermark.fontSize}
							gap={watermark.gap}
						/>
					</Box>
				)}
			</Box>
		);
	},
);

ScreenshotContainer.displayName = "ScreenshotContainer";

export { ScreenshotContainer };
export type { WatermarkConfig };
