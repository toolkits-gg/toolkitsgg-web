import { modals } from "@mantine/modals";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { resolveDisplayName } from "#/features/game/data/user-profile/user-profile";
import {
	CLAIM_PROMPT_MODAL_ID,
	ClaimAnonDataPrompt,
} from "#/features/sync/ClaimAnonDataPrompt";
import { countClaimableAnonOps } from "#/features/sync/claimable-anon-data";
import {
	clearClaimSnooze,
	isClaimPromptEnabled,
	isClaimSnoozed,
	snoozeClaim,
} from "#/features/sync/identity/claim-prompt-preference";
import { runAnonDataClaim } from "#/features/sync/run-claim";
import { useSession } from "#/integrations/better-auth/auth-client";

/**
 * Offers the anon-data claim the first time a session appears.
 *
 * Watching the session rather than hooking the sign-in form is deliberate: the
 * Discord flow leaves via a redirect and comes back at `/`, so there is no
 * client-side callback to hang this off. Every route that can produce a session
 * passes through here.
 *
 * The claim itself only runs on the user's say-so. Declining leaves the rows
 * keyed to the anon ID, which means they stop rendering until the user signs
 * out or claims them from Profile -> Data Sync.
 */
const ClaimAnonDataOnSignIn = () => {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const promptedFor = useRef<string | null>(null);

	const user = session?.user ?? null;
	const userId = user?.id ?? null;
	const accountName = resolveDisplayName(undefined, user);

	useEffect(() => {
		// Signing out has to re-arm the prompt: the snooze outlives the session it
		// was set for, and the next sign-in may well be a different account.
		if (!userId) {
			clearClaimSnooze();
			promptedFor.current = null;
			return;
		}
		if (promptedFor.current === userId) return;
		promptedFor.current = userId;

		void countClaimableAnonOps().then(({ count }) => {
			if (!count) return;
			if (!isClaimPromptEnabled() || isClaimSnoozed(userId)) return;

			modals.open({
				modalId: CLAIM_PROMPT_MODAL_ID,
				title: "Local changes found",
				closeOnClickOutside: false,
				// Closing covers every outcome, including Escape and the close button,
				// and the user has acted on the prompt in all of them. Snoozing here
				// rather than in a button handler is what makes the dismissal paths
				// behave like "Not now".
				onClose: () => snoozeClaim(userId),
				children: (
					<ClaimAnonDataPrompt
						accountName={accountName}
						count={count}
						onClaim={() => {
							void runAnonDataClaim(userId, queryClient);
						}}
					/>
				),
			});
		});
	}, [userId, accountName, queryClient]);

	return null;
};

export { ClaimAnonDataOnSignIn };
