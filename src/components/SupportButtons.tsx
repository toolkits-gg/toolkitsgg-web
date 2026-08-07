import { Button, Stack } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { SiDiscord, SiKofi, SiPatreon, SiPaypal } from "react-icons/si";
import { DISCORD_URL, KOFI_URL, PATREON_URL, PAYPAL_URL } from "#/constants.ts";

const SupportButtons = () => {
	return (
		<Stack gap="sm">
			<Button
				component={Link}
				href={PATREON_URL}
				target="_blank"
				rel="noopener noreferrer"
				leftSection={<SiPatreon size={18} />}
				variant="light"
				color="red"
				fullWidth
			>
				Support on Patreon
			</Button>

			<Button
				component={Link}
				href={PAYPAL_URL}
				target="_blank"
				rel="noopener noreferrer"
				leftSection={<SiPaypal size={18} />}
				variant="light"
				color="blue"
				fullWidth
			>
				Support via PayPal
			</Button>

			<Button
				component={Link}
				href={KOFI_URL}
				target="_blank"
				rel="noopener noreferrer"
				leftSection={<SiKofi size={18} />}
				variant="light"
				color="cyan"
				fullWidth
			>
				Support on Ko-fi
			</Button>
			<Button
				component={Link}
				href={DISCORD_URL}
				target="_blank"
				rel="noopener noreferrer"
				leftSection={<SiDiscord size={18} />}
				variant="light"
				color="violet"
				fullWidth
			>
				Join the Community
			</Button>
		</Stack>
	);
};

export { SupportButtons };
