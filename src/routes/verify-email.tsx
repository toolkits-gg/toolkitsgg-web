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

type VerifyEmailSearch = {
	error?: string;
	email?: string;
};

const emailSchema = z.email("Enter a valid email").min(1, "Email is required");

const ERROR_COPY: Record<string, string> = {
	TOKEN_EXPIRED: "That verification link has expired.",
	INVALID_TOKEN: "That verification link is not valid.",
	USER_NOT_FOUND: "We could not find an account for that link.",
};

const VerifyEmailPage = () => {
	const { error, email } = Route.useSearch();
	const [resent, setResent] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { email: email ?? "" },
		onSubmit: async ({ value }) => {
			setServerError(null);
			const result = await authClient.sendVerificationEmail({
				email: value.email,
				callbackURL: "/verify-email",
			});
			if (result.error) {
				setServerError(
					result.error.message ?? "Could not send the verification email",
				);
				return;
			}
			setResent(true);
		},
	});

	return (
		<Flex align="center" justify="center" p="xl" style={{ minHeight: "60vh" }}>
			<Paper radius="md" p="lg" withBorder w="100%" maw={420}>
				{error ? (
					<Stack>
						<Title order={3}>Verification failed</Title>
						<Alert color="red" title="We could not verify your email">
							{ERROR_COPY[error] ??
								"Something went wrong verifying your email address."}{" "}
							Enter your address below and we will send a new link.
						</Alert>

						{resent ? (
							<Alert color="green" title="Verification email sent">
								Check your inbox for a fresh verification link.
							</Alert>
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
												onChange={(e) =>
													field.handleChange(e.currentTarget.value)
												}
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
													Resend verification
												</Button>
											)}
										</form.Subscribe>
									</Group>
								</Stack>
							</form>
						)}
					</Stack>
				) : (
					<Stack>
						<Title order={3}>Email verified</Title>
						<Alert color="green" title="You are all set">
							Your email address is confirmed and your account is ready to use.
						</Alert>
						<Anchor component={Link} to="/" size="sm">
							Continue to Toolkits.gg
						</Anchor>
					</Stack>
				)}
			</Paper>
		</Flex>
	);
};

const Route = createFileRoute("/verify-email")({
	validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => ({
		error: typeof search.error === "string" ? search.error : undefined,
		email: typeof search.email === "string" ? search.email : undefined,
	}),
	component: VerifyEmailPage,
});

export { Route };
