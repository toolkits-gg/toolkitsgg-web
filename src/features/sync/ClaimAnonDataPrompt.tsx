import { Button, Checkbox, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { setClaimPromptEnabled } from "#/features/sync/identity/claim-prompt-preference";
import { pluralChanges } from "#/features/sync/run-claim";

const CLAIM_PROMPT_MODAL_ID = "claim-anon-data";

type ClaimAnonDataPromptProps = {
	accountName: string;
	count: number;
	onClaim: () => void;
};

/**
 * The checkbox writes through on change rather than on a button press so that
 * dismissing the modal with Escape or the close button still honours it; those
 * paths never reach a handler of ours. Declining for the session is handled by
 * the opener's `onClose`, for the same reason.
 */
const ClaimAnonDataPrompt = ({
	accountName,
	count,
	onClaim,
}: ClaimAnonDataPromptProps) => {
	const [askAgain, setAskAgain] = useState(true);

	const handleAskAgainChange = (checked: boolean) => {
		setAskAgain(checked);
		setClaimPromptEnabled(checked);
	};

	const handleClaim = () => {
		modals.close(CLAIM_PROMPT_MODAL_ID);
		onClaim();
	};

	return (
		<Stack gap="md">
			<Text size="sm">
				You made {pluralChanges(count)} while signed out. Add them to{" "}
				{accountName}?
			</Text>
			<Text size="sm" c="dimmed">
				If you skip, they stay on this device and won&rsquo;t show up while
				you&rsquo;re signed in. You can add them later from Profile &rarr; Data
				Sync.
			</Text>
			<Checkbox
				checked={askAgain}
				onChange={(event) => handleAskAgainChange(event.currentTarget.checked)}
				label="Ask me again next time I sign in"
			/>
			<Group justify="flex-end" gap="sm">
				<Button
					variant="default"
					onClick={() => modals.close(CLAIM_PROMPT_MODAL_ID)}
				>
					Not now
				</Button>
				<Button onClick={handleClaim}>Add to my account</Button>
			</Group>
		</Stack>
	);
};

export { CLAIM_PROMPT_MODAL_ID, ClaimAnonDataPrompt };
