/**
 * Runs a claim and reports the outcome, shared by the sign-in prompt and the
 * data-sync screen so both surfaces invalidate the same queries and describe the
 * result the same way.
 */

import { notifications } from "@mantine/notifications";
import type { QueryClient } from "@tanstack/react-query";
import { claimAnonData } from "#/features/sync/claim-anon-data";

const pluralChanges = (count: number): string =>
	`${count} change${count === 1 ? "" : "s"}`;

const describeClaim = (applied: number, superseded: number): string => {
	const moved = applied
		? `${pluralChanges(applied)} moved to your account.`
		: "";
	const dropped = superseded
		? `${pluralChanges(superseded)} were already newer on your account.`
		: "";
	return [moved, dropped].filter(Boolean).join(" ");
};

/**
 * Reports its own failure rather than throwing. Nothing is deleted on the way
 * through, so a claim that blows up leaves the data recoverable and the only
 * useful response is the one this already makes: say where to retry.
 */
const runAnonDataClaim = async (
	userId: string,
	queryClient: QueryClient,
): Promise<void> => {
	const result = await claimAnonData(userId).catch(() => null);
	if (!result) {
		notifications.show({
			title: "Couldn't add your local changes",
			message: "They are still on this device. Try again from Data Sync.",
			color: "red",
		});
		return;
	}

	const { claimed, report } = result;
	if (!claimed) return;

	void queryClient.invalidateQueries({ queryKey: ["data"] });
	void queryClient.invalidateQueries({ queryKey: ["sync-queue"] });

	const unresolved = report.errors + report.skipped;
	if (!report.applied && !report.superseded && !unresolved) return;
	notifications.show({
		title: unresolved
			? "Some local changes need attention"
			: "Local changes synced",
		message: unresolved
			? "Open Profile -> Data Sync to finish syncing them."
			: describeClaim(report.applied, report.superseded),
		color: unresolved ? "orange" : "green",
	});
};

export { pluralChanges, runAnonDataClaim };
