import {
	Alert,
	Badge,
	Box,
	Button,
	Group,
	Loader,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SOCIAL_PROVIDERS } from "#/features/user/social-providers";
import { ACCOUNTS_QUERY_KEY, useAccounts } from "#/features/user/use-accounts";
import { authClient } from "#/integrations/better-auth/auth-client";

const SETTINGS_PATH = "/account/settings";

/**
 * better-auth reports link failures by redirecting back with an `error` query
 * parameter rather than in a response body, so the copy for them lives here
 * next to the buttons that trigger the redirect.
 */
const LINK_ERROR_MESSAGES: Record<string, string> = {
	account_already_linked_to_different_user:
		"That account is already attached to a different Toolkits account. Sign in with it directly, or disconnect it there first.",
	unable_to_link_account: "That account could not be connected.",
	"email_doesn't_match":
		"That account's email does not match the one on this account.",
};

const linkErrorMessage = (error: string) =>
	LINK_ERROR_MESSAGES[error] ?? "That account could not be connected.";

type LinkedAccountsCardProps = {
	linkError?: string;
};

const LinkedAccountsCard = ({ linkError }: LinkedAccountsCardProps) => {
	const queryClient = useQueryClient();
	const { data: accounts, isPending } = useAccounts(true);
	const [busyProvider, setBusyProvider] = useState<string | null>(null);
	const [unlinkError, setUnlinkError] = useState<string | null>(null);

	const isOnlyAccount = accounts?.length === 1;

	const connect = async (provider: "discord" | "reddit") => {
		setUnlinkError(null);
		setBusyProvider(provider);
		await authClient.linkSocial({
			provider,
			callbackURL: SETTINGS_PATH,
			errorCallbackURL: SETTINGS_PATH,
		});
	};

	const disconnect = async (providerId: string) => {
		setUnlinkError(null);
		setBusyProvider(providerId);
		const result = await authClient.unlinkAccount({ providerId });
		setBusyProvider(null);
		if (result.error) {
			setUnlinkError(result.error.message ?? "Could not disconnect it.");
			return;
		}
		await queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
	};

	if (isPending) return <Loader size="sm" />;

	return (
		<Stack>
			<Text size="sm" c="dimmed">
				Connect these to sign in with them. They all reach this same Toolkits
				account.
			</Text>
			{linkError && <Alert color="red">{linkErrorMessage(linkError)}</Alert>}
			{unlinkError && <Alert color="red">{unlinkError}</Alert>}
			{SOCIAL_PROVIDERS.map(({ id, label, Icon, iconColor }) => {
				const linked = accounts?.some((account) => account.providerId === id);
				const blocked = Boolean(linked && isOnlyAccount);
				return (
					<Group key={id} justify="space-between" wrap="nowrap">
						<Group gap="xs" wrap="nowrap">
							<Icon size={18} color={iconColor} />
							<Text size="sm">{label}</Text>
							{linked && (
								<Badge color="green" variant="light" size="sm">
									Connected
								</Badge>
							)}
						</Group>
						<Tooltip
							label="This is the only way you can sign in. Add a password first."
							disabled={!blocked}
						>
							<Box>
								<Button
									size="xs"
									variant={linked ? "subtle" : "default"}
									color={linked ? "red" : undefined}
									loading={busyProvider === id}
									disabled={
										blocked || (busyProvider !== null && busyProvider !== id)
									}
									onClick={() => {
										void (linked ? disconnect(id) : connect(id));
									}}
								>
									{linked ? "Disconnect" : "Connect"}
								</Button>
							</Box>
						</Tooltip>
					</Group>
				);
			})}
		</Stack>
	);
};

export { LinkedAccountsCard };
