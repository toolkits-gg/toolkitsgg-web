import { Alert, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { fieldError } from "#/features/user/field-error";
import { authClient } from "#/integrations/better-auth/auth-client";

type ChangeEmailFormProps = {
	currentEmail: string;
	emailVerified: boolean;
};

const emailSchema = z.email("Enter a valid email").min(1, "Email is required");

/**
 * better-auth only sends the confirmation to the current address when that
 * address is verified; an unverified one gets the link at the new address
 * instead. The copy has to follow the branch the server will actually take.
 */
const ChangeEmailForm = ({
	currentEmail,
	emailVerified,
}: ChangeEmailFormProps) => {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { newEmail: "" },
		onSubmit: async ({ value }) => {
			setServerError(null);
			if (value.newEmail === currentEmail) {
				setServerError("That is already your email address.");
				return;
			}
			const result = await authClient.changeEmail({
				newEmail: value.newEmail,
				callbackURL: "/account/settings",
			});
			if (result.error) {
				setServerError(result.error.message ?? "Could not start the change");
				return;
			}
			setSentTo(value.newEmail);
			form.reset();
		},
	});

	if (sentTo) {
		return (
			<Alert color="green" title="Confirm the change">
				{emailVerified
					? `We sent a confirmation link to ${currentEmail}, your current address. Open it to switch your account over to ${sentTo}.`
					: `We sent a confirmation link to ${sentTo}. Open it to switch your account over to that address.`}
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
				<Text size="sm" c="dimmed">
					Your email is currently <strong>{currentEmail}</strong>.{" "}
					{emailVerified
						? "For safety we send the confirmation link to that address, not the new one."
						: "That address is not verified, so we send the confirmation link to the new one instead."}
				</Text>
				<form.Field
					name="newEmail"
					validators={{ onBlur: emailSchema, onSubmit: emailSchema }}
				>
					{(field) => (
						<TextInput
							label="New email"
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
								Send confirmation
							</Button>
						)}
					</form.Subscribe>
				</Group>
			</Stack>
		</form>
	);
};

export { ChangeEmailForm };
