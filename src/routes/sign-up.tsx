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
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { fieldError } from "#/features/user/field-error";
import { SocialSignInButtons } from "#/features/user/SocialSignInButtons";
import {
	USERNAME_MAX_LENGTH,
	usernameSchema,
} from "#/features/user/username-rules";
import { authClient } from "#/integrations/better-auth/auth-client";

const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Enter a valid email");

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters");

const USERNAME_ERROR_MESSAGES: Record<string, string> = {
	USERNAME_IS_ALREADY_TAKEN: "That username is already taken",
	USERNAME_TOO_SHORT: "Username is too short",
	USERNAME_TOO_LONG: "Username is too long",
	INVALID_USERNAME:
		"Username can only contain letters, numbers, underscores, and periods",
};

const SignUpPage = () => {
	const [serverError, setServerError] = useState<string | null>(null);
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [pendingEmail, setPendingEmail] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			username: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			setUsernameError(null);
			const username = value.username.trim();
			const result = await authClient.signUp.email({
				email: value.email,
				password: value.password,
				name: username,
				username,
				callbackURL: "/verify-email",
			});
			if (result.error) {
				const usernameMessage = result.error.code
					? USERNAME_ERROR_MESSAGES[result.error.code]
					: undefined;
				if (usernameMessage) {
					setUsernameError(usernameMessage);
					return;
				}
				setServerError(result.error.message ?? "Sign up failed");
				return;
			}
			// requireEmailVerification means there is no session yet, so there is
			// nowhere to navigate to - the next step happens in their inbox.
			setPendingEmail(value.email);
		},
	});

	if (pendingEmail) {
		return (
			<Flex
				align="center"
				justify="center"
				p="xl"
				style={{ minHeight: "60vh" }}
			>
				<Paper radius="md" p="lg" withBorder w="100%" maw={420}>
					<Stack>
						<Title order={3}>Check your inbox</Title>
						<Alert color="green" title="Verification email sent">
							We sent a verification link to {pendingEmail}. Open it to activate
							your account, then sign in.
						</Alert>
						<Text size="sm" c="dimmed">
							Nothing arrived? Check your spam folder, or request another link.
						</Text>
						<Group justify="space-between">
							<Anchor component={Link} to="/verify-email" size="xs">
								Resend verification email
							</Anchor>
							<Anchor component={Link} to="/sign-in" size="xs">
								Go to sign in
							</Anchor>
						</Group>
					</Stack>
				</Paper>
			</Flex>
		);
	}

	return (
		<Flex align="center" justify="center" p="xl" style={{ minHeight: "60vh" }}>
			<Paper radius="md" p="lg" withBorder w="100%" maw={400}>
				<Title order={3} mb="md">
					Create an account
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
								name="username"
								validators={{
									onBlur: usernameSchema,
									onSubmit: usernameSchema,
								}}
							>
								{(field) => (
									<TextInput
										label="Username"
										placeholder="Username"
										autoComplete="username"
										maxLength={USERNAME_MAX_LENGTH}
										value={field.state.value}
										onChange={(e) => {
											setUsernameError(null);
											field.handleChange(e.currentTarget.value);
										}}
										onBlur={field.handleBlur}
										error={
											usernameError ??
											(field.state.meta.isTouched
												? fieldError(field.state.meta.errors)
												: undefined)
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
										label="Confirm Password"
										placeholder="Confirm password"
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
							<Group justify="space-between" mt="xs">
								<Anchor component={Link} to="/sign-in" c="dimmed" size="xs">
									Already have an account? Sign in
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
											Create account
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

const Route = createFileRoute("/sign-up")({ component: SignUpPage });

export { Route };
