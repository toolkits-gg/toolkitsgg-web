import { Button, Stack } from "@mantine/core";
import {
	SOCIAL_PROVIDERS,
	type SocialProvider,
} from "#/features/user/social-providers";
import { authClient } from "#/integrations/better-auth/auth-client";

const signInWith = (provider: SocialProvider["id"]) => async () => {
	await authClient.signIn.social({ provider, callbackURL: "/" });
};

const SocialSignInButtons = () => (
	<Stack gap="xs">
		{SOCIAL_PROVIDERS.map(({ id, label, Icon, iconColor, buttonColor }) => (
			<Button
				key={id}
				leftSection={<Icon size={18} color={iconColor} />}
				color={buttonColor}
				variant={buttonColor ? undefined : "default"}
				onClick={signInWith(id)}
				fullWidth
			>
				Continue with {label}
			</Button>
		))}
	</Stack>
);

export { SocialSignInButtons };
