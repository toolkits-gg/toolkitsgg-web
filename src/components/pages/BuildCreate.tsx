import { Title } from "@mantine/core";
import type { PropsWithChildren } from "react";

const BuildCreatePage = ({ children }: PropsWithChildren) => (
	<>
		<Title>Create Build</Title>
		{children}
	</>
);

export { BuildCreatePage };
