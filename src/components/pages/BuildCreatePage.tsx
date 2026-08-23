import { BuildEditor } from "#/components/pages/build/BuildEditor";
import type { GameBuildsConfig } from "#/features/game/types";

type BuildCreatePageProps = { builds: GameBuildsConfig };

const BuildCreatePage = ({ builds }: BuildCreatePageProps) => (
	<BuildEditor builds={builds} build={null} heading="Create build" />
);

export { BuildCreatePage };
