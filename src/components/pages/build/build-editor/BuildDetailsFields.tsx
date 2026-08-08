import {
	MultiSelect,
	Select,
	SimpleGrid,
	Stack,
	TextInput,
} from "@mantine/core";
import { BuildImageField } from "#/components/pages/build/build-editor/BuildImageField";
import type { BuildImageValue } from "#/features/build-image/build-image-value";
import type { BuildTagOption } from "#/features/game/types";
import { DescriptionField } from "#/features/markdown/DescriptionField";
import type { BuildVisibility } from "@/prisma";

type BuildDetailsValue = BuildImageValue & {
	name: string;
	description: string;
	visibility: BuildVisibility;
	videoUrl: string;
	referenceUrl: string;
	tags: string[];
};

type BuildDetailsFieldsProps = {
	value: BuildDetailsValue;
	onChange: <K extends keyof BuildDetailsValue>(
		key: K,
		next: BuildDetailsValue[K],
	) => void;
	nameError?: string;
	tagOptions?: BuildTagOption[];
};

const VISIBILITY_OPTIONS = [
	{ value: "PUBLIC", label: "Public - listed and shareable" },
	{ value: "UNLISTED", label: "Unlisted - only people with the link" },
	{ value: "PRIVATE", label: "Private - only you" },
];

const BuildDetailsFields = ({
	value,
	onChange,
	nameError,
	tagOptions,
}: BuildDetailsFieldsProps) => (
	<Stack gap="md">
		<TextInput
			label="Build name"
			placeholder="Name your build"
			required
			value={value.name}
			error={nameError}
			onChange={(event) => onChange("name", event.currentTarget.value)}
		/>
		<DescriptionField
			placeholder="How does this build play?"
			value={value.description}
			onChange={(next) => onChange("description", next)}
		/>
		<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
			<Select
				label="Visibility"
				data={VISIBILITY_OPTIONS}
				allowDeselect={false}
				value={value.visibility}
				onChange={(next) =>
					onChange("visibility", (next ?? "PUBLIC") as BuildVisibility)
				}
			/>
			{tagOptions && tagOptions.length > 0 && (
				<MultiSelect
					label="Tags"
					placeholder="Add tags"
					data={tagOptions}
					searchable
					clearable
					value={value.tags}
					onChange={(next) => onChange("tags", next)}
				/>
			)}
		</SimpleGrid>
		<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
			<TextInput
				label="Video URL"
				placeholder="https://youtube.com/..."
				value={value.videoUrl}
				onChange={(event) => onChange("videoUrl", event.currentTarget.value)}
			/>
			<TextInput
				label="Reference URL"
				placeholder="https://..."
				value={value.referenceUrl}
				onChange={(event) =>
					onChange("referenceUrl", event.currentTarget.value)
				}
			/>
		</SimpleGrid>
		<BuildImageField
			value={value}
			videoUrl={value.videoUrl}
			onChange={(next) => {
				onChange("imageUrl", next.imageUrl);
				onChange("imagePosition", next.imagePosition);
				onChange("imageFit", next.imageFit);
			}}
		/>
	</Stack>
);

export { BuildDetailsFields, type BuildDetailsValue, VISIBILITY_OPTIONS };
