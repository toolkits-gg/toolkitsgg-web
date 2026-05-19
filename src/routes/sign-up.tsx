import {
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
import { LuSwords } from "react-icons/lu";
import { z } from "zod";
import { authClient } from "#/integrations/better-auth/auth-client";

const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Enter a valid email");

const usernameSchema = z.string().min(1, "Username is required");

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters");

const fieldError = (errors: unknown[]): string | undefined => {
	const first = errors[0];
	if (!first) return undefined;
	if (typeof first === "string") return first;
	if (typeof first === "object" && "message" in first) {
		return String((first as { message: unknown }).message);
	}
	return String(first);
};

const SignUpPage = () => {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const handleDiscord = async () => {
		await authClient.signIn.social({ provider: "discord", callbackURL: "/" });
	};

	const form = useForm({
		defaultValues: {
			email: "",
			username: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			const result = await authClient.signUp.email({
				email: value.email,
				password: value.password,
				name: value.username,
				callbackURL: "/",
			});
			if (result.error) {
				setServerError(result.error.message ?? "Sign up failed");
			} else {
				await navigate({ to: "/" });
			}
		},
	});

	return (
		<Flex align="center" justify="center" p="xl" style={{ minHeight: "60vh" }}>
			<Paper radius="md" p="lg" withBorder w="100%" maw={400}>
				<Title order={3} mb="md">
					Create an account
				</Title>
				<Stack>
					<Button
						leftSection={<LuSwords size={18} />}
						variant="default"
						onClick={handleDiscord}
						fullWidth
					>
						Continue with Discord
					</Button>

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
