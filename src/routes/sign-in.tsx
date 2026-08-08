import {
	Alert,
	Anchor,
	Button,
	Divider,
	Flex,
	Group,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { fieldError } from "#/features/user/field-error";
import { SocialSignInButtons } from "#/features/user/SocialSignInButtons";
import { authClient } from "#/integrations/better-auth/auth-client";

const emailSchema = z.email("Enter a valid email").min(1, "Email is required");

const passwordSchema = z.string().min(1, "Password is required");

const SignInPage = () => {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			setServerError(null);
			setUnverifiedEmail(null);
			const result = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});
			if (result.error) {
				// sendOnSignIn is enabled, so better-auth has already mailed a fresh
				// link by the time this comes back.
				if (result.error.code === "EMAIL_NOT_VERIFIED") {
					setUnverifiedEmail(value.email);
					return;
				}
				setServerError(result.error.message ?? "Sign in failed");
			} else {
				await navigate({ to: "/" });
			}
		},
	});

	return (
		<Flex align="center" justify="center" p="xl" style={{ minHeight: "60vh" }}>
			<Paper radius="md" p="lg" withBorder w="100%" maw={400}>
				<Title order={3} mb="md">
					Sign in
				</Title>
				<Stack>
					<SocialSignInButtons />

					<Divider label="Or continue with email" labelPosition="center" />

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<Stack>
							<form.Field
								name="email"
								validators={{
									onBlur: emailSchema,
									onSubmit: emailSchema,
								}}
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
							<form.Field
								name="password"
								validators={{
									onBlur: passwordSchema,
									onSubmit: passwordSchema,
								}}
							>
								{(field) => (
									<PasswordInput
										label="Password"
										placeholder="Password"
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
							{serverError && (
								<Text size="sm" c="red">
									{serverError}
								</Text>
							)}
							{unverifiedEmail && (
								<Alert color="yellow" title="Verify your email first">
									We sent a new verification link to {unverifiedEmail}. Open it
									to finish signing in.
								</Alert>
							)}
							<Group justify="flex-end">
								<Anchor component={Link} to="/forgot-password" size="xs">
									Forgot your password?
								</Anchor>
							</Group>
							<Group justify="space-between" mt="xs">
								<Anchor component={Link} to="/sign-up" c="dimmed" size="xs">
									{"Don't have an account? Register"}
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
											Sign in
										</Button>
									)}
								</form.Subscribe>
							</Group>
						</Stack>
					</form>
				</Stack>
			</Paper>
		</Flex>
	);
};

const Route = createFileRoute("/sign-in")({ component: SignInPage });

export { Route };
