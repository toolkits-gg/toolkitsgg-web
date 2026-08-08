import { Alert, Box, Card, Loader, Stack, Text, Title } from "@mantine/core";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ChangeEmailForm } from "#/features/user/ChangeEmailForm";
import { ChangePasswordForm } from "#/features/user/ChangePasswordForm";
import { LinkedAccountsCard } from "#/features/user/LinkedAccountsCard";
import { SetPasswordForm } from "#/features/user/SetPasswordForm";
import { getSessionUserServerFn } from "#/features/user/session-user";
import { isPlaceholderEmail } from "#/features/user/social-email";
import { socialProviderLabel } from "#/features/user/social-providers";
import { useAccounts } from "#/features/user/use-accounts";

type AccountSettingsSearch = {
	error?: string;
};

const AccountSettingsPage = () => {
	const { error: linkError } = Route.useSearch();
	const user = Route.useLoaderData();

	// A social-only account has no credential row, so there is no current
	// password to check against and changePassword would always fail.
	const { data: accounts, isPending: accountsPending } = useAccounts(true);

	const hasPassword = accounts?.some(
		(account) => account.providerId === "credential",
	);

	const socialProviderName = accounts
		?.map((account) => socialProviderLabel(account.providerId))
		.find(Boolean);

	const placeholderEmail = isPlaceholderEmail(user.email);
	// A password is only usable once the account has a real, verified address to
	// sign in with: the sign-in form takes an email, and requireEmailVerification
	// turns an unverified one away.
	const canSetPassword = !placeholderEmail && user.emailVerified;

	return (
		<Box p="md">
			<Stack gap="lg" maw={560} mx="auto">
				<Title order={2}>Account settings</Title>

				<Card withBorder radius="md" p="lg">
					<Stack>
						<Title order={4}>Email address</Title>
						{placeholderEmail && (
							<Alert color="primary" title="No email on file">
								<Text size="sm">
									Reddit never shares the email address on your account, so we
									gave you a placeholder. Nothing can be delivered to it. Add a
									real address below if you want password resets and
									notifications.
								</Text>
							</Alert>
						)}
						<ChangeEmailForm
							currentEmail={user.email}
							emailVerified={user.emailVerified}
						/>
					</Stack>
				</Card>

				<Card withBorder radius="md" p="lg">
					<Stack>
						<Title order={4}>Connected accounts</Title>
						<LinkedAccountsCard linkError={linkError} />
					</Stack>
				</Card>

				<Card withBorder radius="md" p="lg">
					<Stack>
						<Title order={4}>Password</Title>
						{accountsPending ? (
							<Loader size="sm" />
						) : hasPassword ? (
							<ChangePasswordForm />
						) : canSetPassword ? (
							<SetPasswordForm />
						) : (
							<Alert color="primary" title="No password set">
								<Text size="sm">
									You sign in with {socialProviderName ?? "a social account"}.
									Add a verified email address above, and you can set a password
									here too.
								</Text>
							</Alert>
						)}
					</Stack>
				</Card>
			</Stack>
		</Box>
	);
};

const Route = createFileRoute("/account/settings")({
	validateSearch: (search: Record<string, unknown>): AccountSettingsSearch => ({
		error: typeof search.error === "string" ? search.error : undefined,
	}),
	// Resolved on the server so SSR and the first client render agree. See the
	// note on getSessionUser for why useSession() cannot gate this route.
	loader: async () => {
		const user = await getSessionUserServerFn();
		if (!user) throw redirect({ to: "/sign-in", replace: true });
		return user;
	},
	component: AccountSettingsPage,
});

export { Route };
