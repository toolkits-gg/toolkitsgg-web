import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { LuGithub } from "react-icons/lu";
import { SiDiscord } from "react-icons/si";
import { CODEBERG_URL, DISCORD_URL } from "#/constants.ts";

const SocialMedia = () => {
	return (
		<Group gap="xs" data-wizard-target="social-media">
			<Tooltip label="Join our Discord community">
				<ActionIcon
					component={Link}
					href={DISCORD_URL}
					target="_blank"
					rel="noopener noreferrer"
					variant="subtle"
					size="sm"
					color="sidebarFg.5"
					aria-label="Join our Discord"
				>
					<SiDiscord size={16} />
				</ActionIcon>
			</Tooltip>

			<Tooltip label="View on GitHub">
				<ActionIcon
					component={Link}
					href={CODEBERG_URL}
					target="_blank"
					rel="noopener noreferrer"
					variant="subtle"
					size="sm"
					color="sidebarFg.5"
					aria-label="View project on GitHub"
				>
					<LuGithub size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
};

export { SocialMedia };
