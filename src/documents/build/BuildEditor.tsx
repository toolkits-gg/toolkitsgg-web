import {
	Alert,
	Button,
	Divider,
	Group,
	Paper,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { createId } from "@paralleldrive/cuid2";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { BuildDetailsFields } from "#/documents/build/build-editor/BuildDetailsFields.tsx";
import { BuildVariantSetSection } from "#/documents/build/build-editor/BuildVariantSetSection.tsx";
import { ShareBuildButton } from "#/documents/build/build-view/ShareBuildButton.tsx";
import { useBuildDraftState } from "#/documents/build/use-build-draft-state.ts";
import { useFailedSaveDraft } from "#/documents/build/use-failed-save-draft.ts";
import type { CreatedBuildRecord } from "#/features/game/data/types.ts";
import type { GameBuildsConfig } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

type BuildEditorProps = {
	builds: GameBuildsConfig;
	// The persisted build while editing; null while creating
	build: CreatedBuildRecord | null;
	heading: string;
	// The viewer is editing someone else's build under `build:moderate`, so the
	// save has to skip the ownership update path.
	asModerator?: boolean;
};

/** Empty strings come from cleared inputs and should persist as NULL, not "". */
const orNull = (value: string): string | null =>
	value.trim() === "" ? null : value.trim();

const toIso = (value: Date | string | null | undefined): string | null =>
	value instanceof Date ? value.toISOString() : (value ?? null);

/**
 * The app-level create/edit shell. It owns every field that isn't game-specific
 * plus the save path (including the local queue), and delegates only the
 * loadout to the game's build tool.
 */
const BuildEditor = ({
	builds,
	build,
	heading,
	asModerator = false,
}: BuildEditorProps) => {
	const gameId = useGameId();
	const navigate = useNavigate();

	const { details, loadout, setField, setLoadout, restore, clearDraft } =
		useBuildDraftState({ build, gameId });
	const failedSave = useFailedSaveDraft(gameId, build?.id ?? null);

	const [nameError, setNameError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const confirmDiscard = useCallback(
		() =>
			!window.confirm(
				"Your last save didn't go through. Leave and discard those changes?",
			),
		[],
	);

	/**
	 * After a failed save the edit exists only in this component's state, so leaving
	 * would discard it silently. Active only while the error is showing, and only when
	 * editing. A new build already survives a reload in the query string, and a
	 * successful save clears `error` before it navigates, so neither activates it.
	 */
	useBlocker({
		shouldBlockFn: confirmDiscard,
		disabled: build === null || error === null,
	});

	const create = builds.data.builds.useCreate();
	const update = builds.data.builds.useUpdate();
	const moderatorUpdate = builds.data.moderation?.useModeratorUpdate();
	const isSaving =
		create.isPending || update.isPending || !!moderatorUpdate?.isPending;

	const handleFieldChange: typeof setField = (key, next) => {
		setField(key, next);
		if (key === "name") setNameError(null);
	};

	const writeFields = () => ({
		name: details.name.trim(),
		description: orNull(details.description),
		visibility: details.visibility,
		videoUrl: orNull(details.videoUrl),
		imageUrl: orNull(details.imageUrl),
		imagePositionX: details.imagePosition.x,
		imagePositionY: details.imagePosition.y,
		imageFit: details.imageFit,
		referenceUrl: orNull(details.referenceUrl),
		loadout,
		tags: details.tags,
	});

	/**
	 * A moderator edit reaches only the reviewable text fields, and goes through
	 * the privileged path because the ordinary update is scoped to the owner.
	 * Loadout, visibility, and tags stay the author's.
	 */
	const saveBuild = async (
		buildId: string,
		fields: ReturnType<typeof writeFields>,
	): Promise<{ id: string }> => {
		if (!asModerator) return update.mutateAsync({ buildId, ...fields });
		if (!moderatorUpdate) throw new Error("Moderation is unavailable here.");
		await moderatorUpdate.mutateAsync({
			buildId,
			name: fields.name,
			description: fields.description,
			videoUrl: fields.videoUrl,
			referenceUrl: fields.referenceUrl,
		});
		return { id: buildId };
	};

	/** Flushes the editor to the saved row without navigating away. */
	const saveCurrent = async () => {
		if (!build) return;
		await saveBuild(build.id, writeFields());
	};

	const handleSubmit = async () => {
		if (details.name.trim() === "") {
			setNameError("Give your build a name.");
			return;
		}
		setNameError(null);
		setError(null);

		const shared = writeFields();

		try {
			const saved = build
				? await saveBuild(build.id, shared)
				: await create.mutateAsync({ buildId: createId(), ...shared });
			clearDraft();
			failedSave.discard();
			if (gameId !== "none") {
				await navigate({
					to: "/$gameId/build/$buildId",
					params: { gameId, buildId: saved.id },
				});
			}
		} catch (cause) {
			// The edit is otherwise held only in component state, so a crash or a closed
			// tab from here would take it with them. The navigation guard covers the
			// deliberate exits; this covers the rest.
			failedSave.keep({
				details,
				loadout,
				baseUpdatedAt: toIso(build?.updatedAt),
			});
			setError(
				cause instanceof Error ? cause.message : "Failed to save build.",
			);
		}
	};

	const restoreFailedSave = () => {
		if (!failedSave.recovered) return;
		restore({
			details: failedSave.recovered.details,
			loadout: failedSave.recovered.loadout,
		});
		failedSave.discard();
	};

	/**
	 * The build moved on elsewhere while the draft sat here, so restoring would put
	 * those newer changes back the way this device last saw them.
	 */
	const recoveredIsStale =
		failedSave.recovered !== null &&
		failedSave.recovered.baseUpdatedAt !== null &&
		failedSave.recovered.baseUpdatedAt !== toIso(build?.updatedAt);

	return (
		<Stack gap="lg" p="md">
			<Title order={2}>{heading}</Title>

			{failedSave.recovered && (
				<Alert color="yellow" title="Unsaved changes from an earlier visit">
					<Stack gap="xs" align="flex-start">
						<Text size="sm">
							A save failed on{" "}
							{new Date(failedSave.recovered.savedAt).toLocaleString()} and
							these changes were kept on this device.
						</Text>
						{recoveredIsStale && (
							<Text size="sm" fw={600}>
								This build has changed since. Restoring replaces what is shown
								now with the older edit.
							</Text>
						)}
						<Group gap="xs">
							<Button size="xs" onClick={restoreFailedSave}>
								Restore changes
							</Button>
							<Button
								size="xs"
								variant="default"
								onClick={() => failedSave.discard()}
							>
								Discard them
							</Button>
						</Group>
					</Stack>
				</Alert>
			)}

			{error && (
				<Alert
					color="red"
					title="Couldn't save"
					withCloseButton
					closeButtonLabel="Dismiss error"
					onClose={() => setError(null)}
				>
					<Stack gap="xs" align="flex-start">
						<Text size="sm">{error}</Text>
						<Text size="xs" c="dimmed">
							Your changes are still here - retrying sends them again.
						</Text>
						<Button
							size="xs"
							variant="light"
							color="red"
							onClick={() => void handleSubmit()}
							loading={isSaving}
						>
							Retry save
						</Button>
					</Stack>
				</Alert>
			)}

			<Paper withBorder p="md" radius="md">
				<BuildDetailsFields
					value={details}
					onChange={handleFieldChange}
					nameError={nameError ?? undefined}
					tagOptions={builds.tagOptions}
				/>
			</Paper>

			{/* Collection writes are scoped to the owner on the server, so a
			    moderator could only fail every control in here. */}
			{build && !asModerator && (
				<BuildVariantSetSection
					builds={builds}
					build={build}
					saveCurrent={saveCurrent}
					onError={setError}
				/>
			)}

			<Divider label="Build" labelPosition="left" />

			<Paper withBorder p="md" radius="md">
				{builds.renderBuildTool({
					mode: build ? "edit" : "create",
					value: loadout,
					onChange: setLoadout,
					readOnly: false,
					screenshotMode: false,
					build,
				})}
			</Paper>

			<Group justify="flex-end">
				{!build && (
					<ShareBuildButton
						buildDraft={{
							loadout,
							name: details.name,
							tags: details.tags,
							videoUrl: details.videoUrl,
							imageUrl: details.imageUrl,
							imagePosition: details.imagePosition,
							imageFit: details.imageFit,
							referenceUrl: details.referenceUrl,
						}}
						label="Share this draft"
					/>
				)}
				<Button
					variant="default"
					disabled={isSaving}
					onClick={() => {
						clearDraft();
						if (build && gameId !== "none") {
							void navigate({
								to: "/$gameId/build/$buildId",
								params: { gameId, buildId: build.id },
							});
							return;
						}
						void navigate({ to: "/$gameId", params: { gameId } });
					}}
				>
					Cancel
				</Button>
				<Button loading={isSaving} onClick={() => void handleSubmit()}>
					{build ? "Save changes" : "Create build"}
				</Button>
			</Group>
		</Stack>
	);
};

export { BuildEditor };
