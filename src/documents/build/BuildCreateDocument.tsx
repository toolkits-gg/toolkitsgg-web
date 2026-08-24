import { BuildEditor } from "#/documents/build/BuildEditor.tsx";
import type { GameBuildsConfig } from "#/features/game/types.ts";

type BuildCreateDocumentsProps = { builds: GameBuildsConfig };

const BuildCreateDocument = ({ builds }: BuildCreateDocumentsProps) => (
	<BuildEditor builds={builds} build={null} heading="Create build" />
);

export { BuildCreateDocument };
