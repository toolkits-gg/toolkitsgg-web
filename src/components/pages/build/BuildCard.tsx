import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BuildImageFrame } from "#/features/build-image/BuildImageFrame";
import { toBuildImageValue } from "#/features/build-image/build-image-value";
import type { CreatedBuildSummary } from "#/features/game/data/types";
import type { BuildVisibility, GameId } from "@/prisma";

type BuildCardProps = {
	build: CreatedBuildSummary;
	gameId: GameId;
	actions?: ReactNode;
	showVisibility?: boolean;
};

const VISIBILITY_COLORS: Record<BuildVisibility, string> = {
	PUBLIC: "green",
	UNLISTED: "yellow",
	PRIVATE: "gray",
};
const BuildCard = ({
	build,
	gameId,
	actions,
	showVisibility = true,
}: BuildCardProps) => {
	const image = toBuildImageValue(build);
	const { variantSet } = build;

	const target: LinkProps = variantSet
		? {
				to: "/$gameId/build-collection/$collectionId",
				params: { gameId, collectionId: variantSet.collectionId },
				search: { variant: build.id },
			}
		: { to: "/$gameId/build/$buildId", params: { gameId, buildId: build.id } };

	return (
		<Card withBorder padding="sm" radius="md">
			<Card.Section>
				<Link {...target} style={{ textDecoration: "none", color: "inherit" }}>
					<BuildImageFrame
						src={image.imageUrl || undefined}
						alt={build.name}
						fit={image.imageFit}
						position={image.imagePosition}
						height={140}
					/>
				</Link>
			</Card.Section>
			<Group justify="space-between" mt="sm" wrap="nowrap">
				<Stack gap={2} style={{ minWidth: 0 }}>
					<Link
						{...target}
						style={{ textDecoration: "none", color: "inherit", minWidth: 0 }}
					>
						<Text fw={600} lineClamp={1}>
							{variantSet ? variantSet.name : build.name}
						</Text>
					</Link>
					{variantSet && (
						<Text fz="xs" c="dimmed" lineClamp={1}>
							{build.name}
						</Text>
					)}
				</Stack>
				<Group gap="xs" wrap="nowrap">
					{variantSet && (
						<Badge color="primary" variant="light" size="sm">
							{variantSet.variantCount} variants
						</Badge>
					)}
					{showVisibility && (
						<Badge
							color={VISIBILITY_COLORS[build.visibility] ?? "gray"}
							variant="light"
							size="sm"
						>
							{build.visibility}
						</Badge>
					)}
					{actions}
				</Group>
			</Group>
		</Card>
	);
};

export { BuildCard, VISIBILITY_COLORS };
