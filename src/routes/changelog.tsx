import { Container } from "@mantine/core";
import { Markdown } from "@tanstack/markdown/react";
import { createFileRoute } from "@tanstack/react-router";
import changelogContent from "../../CHANGELOG.md?raw";

function ChangelogPage() {
	return (
		<Container>
			<Markdown>{changelogContent}</Markdown>
		</Container>
	);
}

const Route = createFileRoute("/changelog")({
	component: ChangelogPage,
});

export { Route };
