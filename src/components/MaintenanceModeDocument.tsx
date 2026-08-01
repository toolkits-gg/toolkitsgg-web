import { LuWrench } from "react-icons/lu";
import { LockdownDocument } from "#/components/LockdownDocument.tsx";
import { clientEnv } from "#/env/client-env.ts";

/**
 * Shell rendered in place of `RootDocument` when
 * `VITE_ENABLE_MAINTENANCE_MODE` is set. Blocks the entire site.
 */
export const MaintenanceModeDocument = () => {
	return (
		<LockdownDocument
			documentTitle="Under Maintenance"
			badge="Maintenance in progress"
			heading={<>We&rsquo;ll be right back</>}
			description={
				<>
					{clientEnv.VITE_APP_NAME} is temporarily offline while we ship some
					upgrades. Builds, loadouts, and everything else are safe, and will be
					available again soon.
				</>
			}
			linksIntro="Check back shortly, or follow along for updates:"
			footerIcon={<LuWrench size={12} />}
			footerLabel="maintenance mode"
		/>
	);
};
