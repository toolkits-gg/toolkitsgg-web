import { Anchor, Badge, Group, Stack, Title } from "@mantine/core";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { VISIBILITY_COLORS } from "#/components/pages/build/BuildCard";
import { BuildImageBanner } from "#/components/pages/build/build-view/BuildImageBanner";
import type { BuildImageValue } from "#/features/build-image/build-image-value";
import type {
	BuildLoadoutEntry,
	CreatedBuildRecord,
} from "#/features/game/data/types";
import type { GameBuildsConfig } from "#/features/game/types";
import { useGameId } from "#/features/game/use-game-id";
import { MarkdownDescription } from "#/features/markdown/MarkdownDescription";
import { ScreenshotContainer } from "#/features/screenshot/ScreenshotContainer";
import type { WatermarkConfig } from "#/features/screenshot/types";
import { useScreenshot } from "#/features/screenshot/use-screenshot";
import { getGameMetadata } from "#/games-registry/public-registry";
import type { BuildVisibility } from "@/prisma";

type BuildViewLayoutProps = {
	builds: GameBuildsConfig;
	name: string;
	description?: string | null;
	visibility?: BuildVisibility;
	tags: string[];
	loadout: BuildLoadoutEntry[];
	image?: BuildImageValue | null;
	videoUrl?: string | null;
	referenceUrl?: string | null;
	/** The persisted build, or null when the build only exists in the URL. */
	build: CreatedBuildRecord | null;
	/** Rendered in the header */
	renderActions: (args: {
		screenshotLoading: boolean;
		onScreenshot: () => void;
	}) => ReactNode;
};

/**
 * The read-only presentation of a build, shared by the saved-build view and the
 * URL-encoded preview. It owns screenshot mode and the watermark; the pages
 * above it own where the build came from and what actions it offers.
 */
const BuildViewLayout = ({
	builds,
	name,
	description,
	visibility,
	tags,
	loadout,
	image,
	videoUrl,
	referenceUrl,
	build,
	renderActions,
}: BuildViewLayoutProps) => {
	const gameId = useGameId();

	// The banner is what opens the video, so the text link is only the fallback
	// for a build with no image to hang it on.
	const showVideoLink = image?.imageUrl ? null : videoUrl;

	const [screenshotMode, setScreenshotMode] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const metadata = getGameMetadata(gameId);
	const watermark: WatermarkConfig | false = metadata
		? {
				gameConfig: {
					METADATA: {
						LogoComponent: metadata.LogoComponent,
						label: metadata.label,
					},
				},
			}
		: false;

	const { triggerScreenshot, screenshotLoading } = useScreenshot({
		ref: containerRef,
		filename: `${name || "build"}.png`,
	});

	const captureStartedRef = useRef(false);
	useEffect(() => {
		if (screenshotLoading) {
			captureStartedRef.current = true;
		} else if (captureStartedRef.current) {
			captureStartedRef.current = false;
			// Screenshot mode has to survive until the capture finishes, so it is cleared
			// on the falling edge of screenshotLoading rather than right after triggering.
			setScreenshotMode(false);
		}
	}, [screenshotLoading]);

	return (
		<Stack gap="md" p="md">
			<Group justify="space-between" align="flex-start" wrap="nowrap">
				<Stack gap={4}>
					<Title order={2}>{name}</Title>
					<Group gap="xs">
						{visibility && (
							<Badge
								color={VISIBILITY_COLORS[visibility] ?? "gray"}
								variant="light"
								size="sm"
							>
								{visibility}
							</Badge>
						)}
						{tags.map((tag) => (
							<Badge key={tag} variant="outline" size="sm">
								{tag}
							</Badge>
						))}
					</Group>
				</Stack>
				{renderActions({
					screenshotLoading,
					onScreenshot: () => {
						setScreenshotMode(true);
						triggerScreenshot();
					},
				})}
			</Group>

			<ScreenshotContainer
				ref={containerRef}
				screenshotMode={screenshotMode}
				watermark={watermark}
				title={screenshotMode ? name : undefined}
				miw={screenshotMode ? 500 : undefined}
			>
				<Stack gap="md">
					<BuildImageBanner
						image={image}
						name={name}
						videoUrl={videoUrl}
						referenceUrl={referenceUrl}
						screenshotMode={screenshotMode}
					/>

					<MarkdownDescription>{description}</MarkdownDescription>

					{builds.renderBuildTool({
						mode: "view",
						value: loadout,
						onChange: () => {},
						readOnly: true,
						screenshotMode,
						build,
					})}

					{!screenshotMode && (showVideoLink || referenceUrl) && (
						<Group gap="md">
							{showVideoLink && (
								<Anchor href={showVideoLink} target="_blank" rel="noreferrer">
									Video
								</Anchor>
							)}
							{referenceUrl && (
								<Anchor href={referenceUrl} target="_blank" rel="noreferrer">
									Reference
								</Anchor>
							)}
						</Group>
					)}
				</Stack>
			</ScreenshotContainer>
		</Stack>
	);
};

export { BuildViewLayout };
