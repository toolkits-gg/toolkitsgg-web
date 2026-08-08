import { Group, Input, Stack, Tabs, Text, Textarea } from "@mantine/core";
import { MAX_DESCRIPTION_LENGTH } from "#/features/markdown/constants";
import { MarkdownDescription } from "#/features/markdown/MarkdownDescription";

type DescriptionFieldProps = {
	label?: string;
	placeholder?: string;
	value: string;
	onChange: (next: string) => void;
	minRows?: number;
	maxLength?: number;
};

const CharacterCount = ({ used, max }: { used: number; max: number }) => {
	const color = used >= max ? "red" : used >= max * 0.9 ? "orange" : "dimmed";
	return (
		<Text size="xs" c={color} ta="right">
			{used.toLocaleString()} / {max.toLocaleString()}
		</Text>
	);
};

/**
 * A markdown description input: the raw source on one tab, the exact rendering
 * the reader will get on the other, with a live character count under both so
 * the number never disappears mid-edit.
 */
const DescriptionField = ({
	label = "Description",
	placeholder,
	value,
	onChange,
	minRows = 3,
	maxLength = MAX_DESCRIPTION_LENGTH,
}: DescriptionFieldProps) => (
	<Input.Wrapper label={label}>
		<Stack gap={4}>
			<Tabs defaultValue="write" variant="outline">
				<Tabs.List>
					<Tabs.Tab value="write">Write</Tabs.Tab>
					<Tabs.Tab value="preview">Preview</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="write" pt="xs">
					<Textarea
						placeholder={placeholder}
						autosize
						minRows={minRows}
						maxLength={maxLength}
						value={value}
						onChange={(event) => onChange(event.currentTarget.value)}
					/>
				</Tabs.Panel>
				<Tabs.Panel value="preview" pt="xs">
					{value.trim() ? (
						<MarkdownDescription>{value}</MarkdownDescription>
					) : (
						<Text size="sm" c="dimmed" fs="italic">
							Nothing to preview yet.
						</Text>
					)}
				</Tabs.Panel>
			</Tabs>
			<Group justify="space-between" gap="xs" wrap="nowrap">
				<Text size="xs" c="dimmed">
					Markdown supported
				</Text>
				<CharacterCount used={value.length} max={maxLength} />
			</Group>
		</Stack>
	</Input.Wrapper>
);

export { DescriptionField };
