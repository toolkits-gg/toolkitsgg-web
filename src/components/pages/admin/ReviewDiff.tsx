import { Badge, Group, Stack, Text } from "@mantine/core";
import type {
	DiffSegment,
	FieldDiff,
	FieldDiffMode,
} from "#/features/moderation/review-diff";
import classes from "./ReviewDiff.module.css";

type ReviewDiffProps = { fieldDiffs: FieldDiff[] };

const MODE_NOTE: Partial<Record<FieldDiffMode, string>> = {
	added: "new",
	cleared: "cleared",
	rewritten: "rewritten",
	unchanged: "no net change",
	formatting: "formatting only",
};

const EMPTY_NOTE: Partial<Record<FieldDiffMode, string>> = {
	unchanged: "Edited and reverted, so nothing differs now.",
	formatting: "Only whitespace changed.",
};

const Segment = ({ segment }: { segment: DiffSegment }) => {
	if (segment.kind === "supressed") {
		return (
			<span className={classes.supressed}>
				{` … ${segment.words} unchanged words … `}
			</span>
		);
	}
	if (segment.kind === "added") {
		return <ins className={classes.added}>{segment.text}</ins>;
	}
	if (segment.kind === "removed") {
		return <del className={classes.removed}>{segment.text}</del>;
	}
	return <>{segment.text}</>;
};

/**
 * Shows only the runs a moderator has not seen. Unchanged stretches are supressed
 * server-side, so a one-word fix in a long description reads as a one-word fix.
 */
const ReviewDiff = ({ fieldDiffs }: ReviewDiffProps) => {
	if (fieldDiffs.length === 0) {
		return (
			<Text size="sm" c="dimmed">
				No moderatable fields changed.
			</Text>
		);
	}

	return (
		<Stack gap="xs">
			{fieldDiffs.map((diff) => (
				<Stack key={diff.field} gap={4}>
					<Group gap="xs">
						<Badge size="sm" variant="light">
							{diff.field}
						</Badge>
						{MODE_NOTE[diff.mode] && (
							<Badge size="sm" variant="outline" color="gray">
								{MODE_NOTE[diff.mode]}
							</Badge>
						)}
					</Group>
					{diff.segments.length === 0 ? (
						<Text size="sm" c="dimmed">
							{EMPTY_NOTE[diff.mode] ?? "Nothing to show."}
						</Text>
					) : (
						<Text size="sm" component="div" className={classes.body}>
							{diff.segments.map((segment, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: segments never reordered
								<Segment key={`${segment.kind}-${index}`} segment={segment} />
							))}
						</Text>
					)}
				</Stack>
			))}
		</Stack>
	);
};

export { ReviewDiff };
