import { Button, Stack } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { SiDiscord, SiGithub } from "react-icons/si";
import { CODEBERG_URL, DISCORD_URL } from "#/constants.ts";

const SocialMediaContent = () => {
	return (
		<Stack gap="sm">
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
				Join our Discord
			</Button>

			<Button
				component={Link}
				href={CODEBERG_URL}
				target="_blank"
				rel="noopener noreferrer"
				leftSection={<SiGithub size={18} />}
				variant="light"
				fullWidth
			>
				View on GitHub
			</Button>
		</Stack>
	);
};

export { SocialMediaContent };
