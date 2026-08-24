import {
	Alert,
	Button,
	Group,
	Select,
	Stack,
	Switch,
	TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { createId } from "@paralleldrive/cuid2";
import { useState } from "react";
import { VISIBILITY_OPTIONS } from "#/documents/build/build-editor/BuildDetailsFields.tsx";
import type {
	BuildCollectionSummary,
	GameBuildCollectionsData,
} from "#/features/game/data/types.ts";
import { DescriptionField } from "#/features/markdown/DescriptionField.tsx";
import type { BuildVisibility } from "@/prisma";

type BuildCollectionFormProps = {
	collections: GameBuildCollectionsData;
	// Omit to create; pass a collection to edit.
	collection?: BuildCollectionSummary;
	onSaved?: (collection: BuildCollectionSummary) => void;
};

/** Create/edit form rendered inside a Mantine modal. */
const BuildCollectionForm = ({
	collections,
	collection,
	onSaved,
}: BuildCollectionFormProps) => {
	const [name, setName] = useState(collection?.name ?? "");
	const [description, setDescription] = useState(collection?.description ?? "");
	const [visibility, setVisibility] = useState<BuildVisibility>(
		collection?.visibility ?? "PUBLIC",
	);
	const [asVariants, setAsVariants] = useState(
		collection?.displayMode === "VARIANTS",
	);
	// Field-level problems sit on the field; the alert is for save failures.
	const [nameError, setNameError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const create = collections.useCreate();
	const update = collections.useUpdate();
	const isSaving = create.isPending || update.isPending;

	const handleSubmit = async () => {
		if (name.trim() === "") {
			setNameError("Give your collection a name.");
			return;
		}
		setNameError(null);
		setError(null);

		const shared = {
			name: name.trim(),
			description: description.trim() === "" ? null : description.trim(),
			visibility,
			displayMode: asVariants ? ("VARIANTS" as const) : ("CARDS" as const),
		};

		try {
			const saved = collection
				? await update.mutateAsync({
						collectionId: collection.id,
						...shared,
					})
				: await create.mutateAsync({ collectionId: createId(), ...shared });
			onSaved?.(saved);
			modals.closeAll();
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Failed to save collection.",
			);
		}
	};

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void handleSubmit();
			}}
		>
			<Stack gap="md">
				{error && (
					<Alert
						color="red"
						title="Couldn't save"
						withCloseButton
						closeButtonLabel="Dismiss error"
						onClose={() => setError(null)}
					>
						{error}
					</Alert>
				)}
				<TextInput
					label="Name"
					placeholder="Name your collection"
					required
					data-autofocus
					value={name}
					error={nameError ?? undefined}
					onChange={(event) => {
						setName(event.currentTarget.value);
						setNameError(null);
					}}
				/>
				<DescriptionField
					placeholder="What ties these builds together?"
					minRows={2}
					value={description}
					onChange={setDescription}
				/>
				<Select
					label="Visibility"
					data={VISIBILITY_OPTIONS}
					allowDeselect={false}
					value={visibility}
					onChange={(next) =>
						setVisibility((next ?? "PUBLIC") as BuildVisibility)
					}
				/>
				<Switch
					label="Display as build variants"
					description="Show one build at a time on the builder page with a dropdown to switch between them, instead of a grid of cards. Applies to everyone who opens the collection."
					checked={asVariants}
					onChange={(event) => setAsVariants(event.currentTarget.checked)}
				/>
				<Group justify="flex-end">
					<Button
						variant="default"
						disabled={isSaving}
						onClick={() => modals.closeAll()}
					>
						Cancel
					</Button>
					<Button type="submit" loading={isSaving}>
						{collection ? "Save changes" : "Create collection"}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export { BuildCollectionForm };
