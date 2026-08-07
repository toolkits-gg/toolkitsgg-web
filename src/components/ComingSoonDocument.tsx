import { LuRocket } from "react-icons/lu";
import { LockdownDocument } from "#/components/LockdownDocument.tsx";
import { clientEnv } from "#/env/client-env.ts";

/**
 * Shell rendered in place of `RootDocument` when `VITE_SHOW_COMING_SOON` is
 * set. Blocks the entire site behind a pre-launch message.
 */
export const ComingSoonDocument = () => {
	return (
		<LockdownDocument
			documentTitle="Coming Soon"
			badge="Coming soon"
			heading={<>Toolkits.gg is on the way.</>}
			description={
				<>
					{clientEnv.VITE_APP_NAME}, the successor to Remnant 2 Toolkit, is on
					the way. Ad-free, paywall free, and open-source build planners, item
					collections, tooling, and so much more.
				</>
			}
			linksIntro="Want to get updates or contribute to the project?"
			footerIcon={<LuRocket size={12} />}
			footerLabel="coming soon"
		/>
	);
};
