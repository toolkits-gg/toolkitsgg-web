import { Title } from "@mantine/core";
import type { PropsWithChildren } from "react";

const BuildEditPage = ({ children }: PropsWithChildren) => (
	<>
		<Title>Edit Build</Title>
		{children}
	</>
);

export { BuildEditPage };
