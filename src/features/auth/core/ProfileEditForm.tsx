import { Button, Group, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { userProfileActions } from "#/features/auth/dal/user-profile/user-profile.actions";
import { useDalMutation } from "#/features/dal/hooks/use-dal-mutation";

type ProfileEditFormProps = {
	initialDisplayName: string;
	initialBio: string;
};

const ProfileEditForm = ({
	initialDisplayName,
	initialBio,
}: ProfileEditFormProps) => {
	const [serverError, setServerError] = useState<string | null>(null);
	const mutation = useDalMutation(userProfileActions.updateProfile);

	const form = useForm({
		defaultValues: {
			displayName: initialDisplayName,
			bio: initialBio,
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			try {
				await mutation.mutateAsync(value);
				modals.closeAll();
			} catch {
				setServerError("Failed to save profile. Please try again.");
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit(); // no action needed
			}}
		>
			<Stack>
				<form.Field
					name="displayName"
					validators={{
						onChange: ({ value }) => {
							if (!value) return "Display name is required";
							if (value.length > 100)
								return "Display name must be 100 characters or fewer";
							return undefined;
						},
					}}
				>
					{(field) => (
						<TextInput
							label="Display name"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.currentTarget.value)}
							onBlur={field.handleBlur}
							error={
								field.state.meta.isTouched && field.state.meta.errors.length > 0
									? field.state.meta.errors[0]
									: undefined
							}
							maxLength={100}
						/>
					)}
				</form.Field>
				<form.Field
					name="bio"
					validators={{
						onChange: ({ value }) => {
							if (value.length > 500)
								return "Bio must be 500 characters or fewer";
							return undefined;
						},
					}}
				>
					{(field) => (
						<Textarea
							label="Bio"
							autosize
							minRows={3}
							maxRows={6}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.currentTarget.value)}
							onBlur={field.handleBlur}
							error={
								field.state.meta.isTouched && field.state.meta.errors.length > 0
									? field.state.meta.errors[0]
									: undefined
							}
							maxLength={500}
						/>
					)}
				</form.Field>
				{serverError && (
					<Text size="sm" c="red">
						{serverError}
					</Text>
				)}
				<Group justify="flex-end">
					<Button variant="default" onClick={() => modals.closeAll()}>
						Cancel
					</Button>
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<Button
								type="submit"
								loading={isSubmitting}
								disabled={!canSubmit}
							>
								Save
							</Button>
						)}
					</form.Subscribe>
				</Group>
			</Stack>
		</form>
	);
};

export { ProfileEditForm };
