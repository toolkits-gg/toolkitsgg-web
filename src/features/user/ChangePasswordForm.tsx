import {
	Alert,
	Button,
	Checkbox,
	Group,
	PasswordInput,
	Stack,
	Text,
} from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { fieldError } from "#/features/user/field-error";
import { authClient } from "#/integrations/better-auth/auth-client";

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters");

const ChangePasswordForm = () => {
	const [done, setDone] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [revokeOthers, setRevokeOthers] = useState(true);

	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			const result = await authClient.changePassword({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				revokeOtherSessions: revokeOthers,
			});
			if (result.error) {
				setServerError(
					result.error.message ?? "Could not change your password",
				);
				return;
			}
			setDone(true);
			form.reset();
		},
	});

	if (done) {
		return (
			<Alert color="green" title="Password updated">
				Your password has been changed
				{revokeOthers ? " and other sessions were signed out" : ""}.
			</Alert>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<Stack>
				<form.Field
					name="currentPassword"
					validators={{
						onSubmit: z.string().min(1, "Enter your current password"),
					}}
				>
					{(field) => (
						<PasswordInput
							label="Current password"
							autoComplete="current-password"
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
				<Checkbox
					label="Sign out other devices"
					checked={revokeOthers}
					onChange={(e) => setRevokeOthers(e.currentTarget.checked)}
				/>
				{serverError && (
					<Text size="sm" c="red">
						{serverError}
					</Text>
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
								Change password
							</Button>
						)}
					</form.Subscribe>
				</Group>
			</Stack>
		</form>
	);
};

export { ChangePasswordForm };
