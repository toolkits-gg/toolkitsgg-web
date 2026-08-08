import { ActionIcon, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ClientOnly, useRouterState } from "@tanstack/react-router";
import { LuShare2 } from "react-icons/lu";
import { clientEnv } from "#/env/client-env";
import { useGameId } from "#/features/game/use-game-id";

type ShareLinkButtonProps = {
	/** Path to share. Defaults to the current route's pathname. */
	path?: string;
	/** Appends `?gameId=` so the link opens against the right game. */
	includeGameId?: boolean;
	label?: string;
	size?: number;
	/**
	 * When set, the button is disabled and this explains why. Used for records
	 * that only exist on this device, where a link would resolve for nobody.
	 */
	disabledReason?: string;
};

/**
 * Copies a shareable absolute URL to the clipboard. Sharing is link-only by
 * design: visibility (PUBLIC / UNLISTED / PRIVATE) is what actually controls
 * access, so there are no share tokens to mint or revoke.
 */
const ShareLinkButton = ({
	path,
	includeGameId = false,
	label = "Copy share link",
	size = 16,
	disabledReason,
}: ShareLinkButtonProps) => {
	const activeGameId = useGameId();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const handleShare = async () => {
		const baseUrl =
			clientEnv.VITE_APP_URL ||
			(typeof window !== "undefined" ? window.location.origin : "");
		const target = path ?? pathname;
		const url = includeGameId
			? `${baseUrl}${target}?gameId=${activeGameId}`
			: `${baseUrl}${target}`;
		try {
			await navigator.clipboard.writeText(url);
			notifications.show({
				title: "Link copied",
				message: "Share link copied to clipboard",
				color: "green",
			});
		} catch {
			notifications.show({
				title: "Couldn't copy link",
				message: "Try again or copy from the address bar.",
				color: "red",
			});
		}
	};

	if (disabledReason) {
		return (
			<ClientOnly>
				<Tooltip label={disabledReason} multiline w={240}>
					{/* Disabled controls emit no pointer events, so the tooltip needs a
					    wrapper to hang off. */}
					<span>
						<ActionIcon variant="subtle" disabled aria-label={disabledReason}>
							<LuShare2 size={size} />
						</ActionIcon>
					</span>
				</Tooltip>
			</ClientOnly>
		);
	}

	return (
		<ClientOnly>
			<Tooltip label={label}>
				<ActionIcon variant="subtle" onClick={handleShare} aria-label={label}>
					<LuShare2 size={size} />
				</ActionIcon>
			</Tooltip>
		</ClientOnly>
	);
};

export { ShareLinkButton };
