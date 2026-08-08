import { ActionIcon, Menu, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ClientOnly } from "@tanstack/react-router";
import { LuLink, LuShare2 } from "react-icons/lu";
import { clientEnv } from "#/env/client-env";
import { useGameId } from "#/features/game/use-game-id";
import {
	type BuildDraftValue,
	buildDraftToSearch,
} from "#/features/search-params/parsers/build-draft";

type ShareBuildButtonProps = {
	/** The build to encode into a self-contained link. */
	buildDraft: Partial<BuildDraftValue>;
	/**
	 * Path to the saved build, when one exists on the server. Absent for
	 * anonymous and unsaved builds, which have nothing for a plain link to
	 * resolve against.
	 */
	buildPath?: string;
	label?: string;
	size?: number;
};

const SELF_CONTAINED_HINT =
	"Works for anyone, even if the build isn't saved to your account. The description isn't included.";

/**
 * Sharing a build, by whichever route is available.
 *
 * A plain link is preferable when the build exists on the server: it stays
 * short and it keeps showing the build's current state. A self-contained link
 * carries the whole build in the URL instead, which is the only option for a
 * build made while signed out, and the only way to share a private one.
 */
const ShareBuildButton = ({
	buildDraft,
	buildPath,
	label = "Share build",
	size = 16,
}: ShareBuildButtonProps) => {
	const gameId = useGameId();

	const baseUrl = () =>
		clientEnv.VITE_APP_URL ||
		(typeof window !== "undefined" ? window.location.origin : "");

	const copy = async (url: string, message: string) => {
		try {
			await navigator.clipboard.writeText(url);
			notifications.show({ title: "Link copied", message, color: "green" });
		} catch {
			notifications.show({
				title: "Couldn't copy link",
				message: "Try again or copy from the address bar.",
				color: "red",
			});
		}
	};

	const copyBuildLink = () =>
		copy(
			`${baseUrl()}${buildPath}?gameId=${gameId}`,
			"Share link copied to clipboard",
		);

	const copySelfContainedLink = () =>
		copy(
			`${baseUrl()}/${gameId}/build/preview?${buildDraftToSearch(buildDraft)}`,
			"The whole build travels in the link. The description isn't included.",
		);

	if (gameId === "none") return null;

	if (!buildPath) {
		return (
			<ClientOnly>
				<Tooltip label={SELF_CONTAINED_HINT} multiline w={240}>
					<ActionIcon
						variant="subtle"
						aria-label={label}
						onClick={() => void copySelfContainedLink()}
					>
						<LuShare2 size={size} />
					</ActionIcon>
				</Tooltip>
			</ClientOnly>
		);
	}

	return (
		<ClientOnly>
			<Menu position="bottom-end" withinPortal>
				<Menu.Target>
					<Tooltip label={label}>
						<ActionIcon variant="subtle" aria-label={label}>
							<LuShare2 size={size} />
						</ActionIcon>
					</Tooltip>
				</Menu.Target>
				<Menu.Dropdown maw={300}>
					<Menu.Item
						leftSection={<LuLink size={14} />}
						onClick={() => void copyBuildLink()}
					>
						Copy link to this build
					</Menu.Item>
					<Menu.Item
						leftSection={<LuShare2 size={14} />}
						onClick={() => void copySelfContainedLink()}
					>
						Copy self-contained link
						<Text component="span" display="block" fz="xs" c="dimmed">
							{SELF_CONTAINED_HINT}
						</Text>
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</ClientOnly>
	);
};

export { ShareBuildButton };
