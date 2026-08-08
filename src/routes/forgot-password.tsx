import {
	Alert,
	Anchor,
	Button,
	Flex,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { fieldError } from "#/features/user/field-error";
import { authClient } from "#/integrations/better-auth/auth-client";

const emailSchema = z.email("Enter a valid email").min(1, "Email is required");

const ForgotPasswordPage = () => {
	const [sent, setSent] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			setServerError(null);
			const result = await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: "/reset-password",
			});
			if (result.error) {
				setServerError(
					result.error.message ?? "Could not send the reset email",
				);
				return;
			}
			setSent(true);
		},
	});

	return (
		<Flex align="center" justify="center" p="xl" style={{ minHeight: "60vh" }}>
			<Paper radius="md" p="lg" withBorder w="100%" maw={400}>
				<Title order={3} mb="md">
					Reset your password
				</Title>

				{sent ? (
					<Stack>
						<Alert color="green" title="Check your inbox">
							If an account exists for that address, we have sent a link to
							reset your password. The link expires in one hour.
						</Alert>
						<Anchor component={Link} to="/sign-in" size="sm">
							Back to sign in
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
							<Text size="sm" c="dimmed">
								Enter the email on your account and we will send you a link to
								choose a new password.
							</Text>
							<form.Field
								name="email"
								validators={{ onBlur: emailSchema, onSubmit: emailSchema }}
							>
								{(field) => (
									<TextInput
										label="Email"
										placeholder="you@example.com"
										type="email"
										autoComplete="email"
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
							<Group justify="space-between" mt="xs">
								<Anchor component={Link} to="/sign-in" c="dimmed" size="xs">
									Back to sign in
								</Anchor>
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
											Send reset link
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

const Route = createFileRoute("/forgot-password")({
	component: ForgotPasswordPage,
});

export { Route };
