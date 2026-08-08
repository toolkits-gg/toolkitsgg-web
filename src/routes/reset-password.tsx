import {
	Alert,
	Anchor,
	Button,
	Flex,
	Group,
	Paper,
	PasswordInput,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { fieldError } from "#/features/user/field-error";
import { authClient } from "#/integrations/better-auth/auth-client";

type ResetPasswordSearch = {
	token?: string;
	error?: string;
};

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters");

const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const { token, error } = Route.useSearch();
	const [serverError, setServerError] = useState<string | null>(null);
	const [done, setDone] = useState(false);

	const form = useForm({
		defaultValues: { password: "", confirmPassword: "" },
		onSubmit: async ({ value }) => {
			setServerError(null);
			if (!token) {
				setServerError("This reset link is no longer valid.");
				return;
			}
			const result = await authClient.resetPassword({
				newPassword: value.password,
				token,
			});
			if (result.error) {
				setServerError(result.error.message ?? "Could not reset your password");
				return;
			}
			setDone(true);
		},
	});

	// better-auth bounces the emailed link through its own endpoint, which lands
	// here with either a verified token or an error code, never both.
	const linkIsBroken = Boolean(error) || !token;

	return (
		<Flex align="center" justify="center" p="xl" style={{ minHeight: "60vh" }}>
			<Paper radius="md" p="lg" withBorder w="100%" maw={400}>
				<Title order={3} mb="md">
					Choose a new password
				</Title>

				{done ? (
					<Stack>
						<Alert color="green" title="Password updated">
							Your password has been changed. You can now sign in with it.
						</Alert>
						<Button onClick={() => navigate({ to: "/sign-in" })} radius="md">
							Go to sign in
						</Button>
					</Stack>
				) : linkIsBroken ? (
					<Stack>
						<Alert color="red" title="This link has expired">
							Password reset links can only be used once and expire after an
							hour. Request a fresh one to continue.
						</Alert>
						<Anchor component={Link} to="/forgot-password" size="sm">
							Request a new reset link
						</Anchor>
					</Stack>
				) : (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<Stack>
							<form.Field
								name="password"
								validators={{
									onBlur: passwordSchema,
									onSubmit: passwordSchema,
								}}
							>
								{(field) => (
									<PasswordInput
										label="New password"
										placeholder="New password"
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
										if (!value) return "Confirm your password";
										if (value !== fieldApi.form.getFieldValue("password")) {
											return "Passwords do not match";
										}
										return undefined;
									},
									onSubmit: ({ value, fieldApi }) => {
										if (!value) return "Confirm your password";
										if (value !== fieldApi.form.getFieldValue("password")) {
											return "Passwords do not match";
										}
										return undefined;
									},
								}}
							>
								{(field) => (
									<PasswordInput
										label="Confirm new password"
										placeholder="Confirm new password"
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
								<Text size="sm" c="red">
									{serverError}
								</Text>
							)}
							<Group justify="flex-end" mt="xs">
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
											Update password
										</Button>
									)}
								</form.Subscribe>
							</Group>
						</Stack>
					</form>
				)}
			</Paper>
		</Flex>
	);
};

const Route = createFileRoute("/reset-password")({
	validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
		error: typeof search.error === "string" ? search.error : undefined,
	}),
	component: ResetPasswordPage,
});

export { Route };
