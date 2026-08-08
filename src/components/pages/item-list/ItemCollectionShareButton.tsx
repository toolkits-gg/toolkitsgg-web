import { Group } from "@mantine/core";
import { ShareLinkButton } from "#/components/ShareLinkButton";

const ItemCollectionShareButton = () => (
	<Group justify="flex-end" px="md" pt="xs">
		<ShareLinkButton includeGameId />
	</Group>
);

export { ItemCollectionShareButton };
