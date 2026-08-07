import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

const Devtools = () => (
	<TanStackDevtools
		config={{
			position: "bottom-right",
		}}
		plugins={[
			{
				name: "Tanstack Router",
				render: <TanStackRouterDevtoolsPanel />,
			},
		]}
	/>
);

export { Devtools };
