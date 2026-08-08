import {
	Alert,
	Button,
	Group,
	PasswordInput,
	Stack,
	Text,
} from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { fieldError } from "#/features/user/field-error";
import { setPasswordServerFn } from "#/features/user/set-password";
import { ACCOUNTS_QUERY_KEY } from "#/features/user/use-accounts";

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters");

const SetPasswordForm = () => {
	const queryClient = useQueryClient();
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { newPassword: "", confirmPassword: "" },
		onSubmit: async ({ value }) => {
			setServerError(null);
			try {
				await setPasswordServerFn({ data: { newPassword: value.newPassword } });
			} catch {
				setServerError("Could not set your password. Please try again.");
				return;
			}
			// The credential row is what the Password card branches on, so the
			// account list has to be refetched for this form to give way to
			// ChangePasswordForm.
			await queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
			form.reset();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<Stack>
				<Text size="sm" c="dimmed">
					Add a password so you can sign in with your email address as well as
					your linked accounts.
				</Text>
				<form.Field
					name="newPassword"
					validators={{ onBlur: passwordSchema, onSubmit: passwordSchema }}
				>
					{(field) => (
						<PasswordInput
							label="New password"
							autoComplete="new-password"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.currentTarget.value)}
							onBlur={field.handleBlur}
							error={
								field.state.meta.isTouched
									? fieldError(field.state.meta.errors)
									: undefined
							}
							radius="md"
						/>
					)}
				</form.Field>
				<form.Field
					name="confirmPassword"
					validators={{
						onBlur: ({ value, fieldApi }) => {
							if (!value) return "Confirm your new password";
							if (value !== fieldApi.form.getFieldValue("newPassword")) {
								return "Passwords do not match";
							}
							return undefined;
						},
						onSubmit: ({ value, fieldApi }) => {
							if (!value) return "Confirm your new password";
							if (value !== fieldApi.form.getFieldValue("newPassword")) {
								return "Passwords do not match";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<PasswordInput
							label="Confirm new password"
							autoComplete="new-password"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.currentTarget.value)}
							onBlur={field.handleBlur}
							error={
								field.state.meta.isTouched
									? fieldError(field.state.meta.errors)
									: undefined
							}
							radius="md"
						/>
					)}
				</form.Field>
				{serverError && (
					<Alert color="red">
						<Text size="sm">{serverError}</Text>
					</Alert>
				)}
				<Group justify="flex-end">
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
								radius="md"
							>
								Set password
							</Button>
						)}
					</form.Subscribe>
				</Group>
			</Stack>
		</form>
	);
};

export { SetPasswordForm };
