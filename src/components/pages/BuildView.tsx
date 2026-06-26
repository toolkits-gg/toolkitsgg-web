import { Title } from "@mantine/core";
import type { PropsWithChildren } from "react";

const BuildViewPage = ({ children }: PropsWithChildren) => (
	<>
		<Title>View Build</Title>
		{children}
	</>
);

export { BuildViewPage };
