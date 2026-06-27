import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ClientOnly, useRouterState } from "@tanstack/react-router";
import { LuShare2 } from "react-icons/lu";
import { clientEnv } from "#/env/client-env.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

const ItemCollectionShareButton = () => {
	const activeGameId = useGameId();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const handleShare = async () => {
		const baseUrl =
			clientEnv.VITE_APP_URL ||
			(typeof window !== "undefined" ? window.location.origin : "");
		const url = `${baseUrl}${pathname}?gameId=${activeGameId}`;
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

	return (
		<ClientOnly>
			<Group justify="flex-end" px="md" pt="xs">
				<Tooltip label="Copy share link">
					<ActionIcon
						variant="subtle"
						onClick={handleShare}
						aria-label="Copy share link"
					>
						<LuShare2 size={16} />
					</ActionIcon>
				</Tooltip>
			</Group>
		</ClientOnly>
	);
};

export { ItemCollectionShareButton };
