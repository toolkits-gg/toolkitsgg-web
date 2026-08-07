import { Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LuCompass } from "react-icons/lu";
import { StatusCard } from "#/components/StatusCard.tsx";

type NotFoundCardProps = {
	badge?: string;
	heading?: ReactNode;
	description?: ReactNode;
	footerLabel?: string;
};

export const NotFoundCard = ({
	badge = "Page not found",
	heading = <>That page doesn&rsquo;t exist.</>,
	description = (
		<>
			We couldn&rsquo;t find the page you&rsquo;re looking for. It may have been
			moved, renamed, or never existed at all.
		</>
	),
	footerLabel = "404 not found",
}: NotFoundCardProps) => {
	return (
		<StatusCard
			variant="embedded"
			badge={badge}
			heading={heading}
			description={description}
			actions={
				<Button component={Link} to="/" size="md">
					Back to home
				</Button>
			}
			linksIntro="Still lost? Find us here:"
			footerIcon={<LuCompass size={12} />}
			footerLabel={footerLabel}
		/>
	);
};
