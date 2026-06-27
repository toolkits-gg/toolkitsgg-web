import { Button, EmptyState } from "@mantine/core";
import { Link } from "@tanstack/react-router";

/** Placeholder body shared by not-yet-implemented profile tabs. */
const ProfileTabPlaceholder = ({ title }: { title: string }) => (
	<EmptyState title={title} description="Content coming soon!">
		<EmptyState.Actions>
			<Button component={Link} variant="default" href={`/profile`}>
				Profile Home
			</Button>
		</EmptyState.Actions>
	</EmptyState>
);

export { ProfileTabPlaceholder };
