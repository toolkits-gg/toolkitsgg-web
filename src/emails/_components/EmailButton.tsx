import { Button, Section, Text } from "react-email";

type EmailButtonProps = {
	href: string;
	label: string;
};

/**
 * CTA button plus a copyable fallback URL, since many mail clients
 * mess with anchor styling.
 */
const EmailButton = ({ href, label }: EmailButtonProps) => {
	return (
		<Section className="mt-6 text-center">
			<Button
				href={href}
				className="rounded-md bg-brand px-6 py-3 text-center font-semibold text-sm text-white no-underline"
			>
				{label}
			</Button>
			<Text className="mt-6 mb-0 text-gray-500 text-xs leading-5">
				Or paste this link into your browser:
			</Text>
			<Text className="m-0 break-all text-gray-500 text-xs leading-5">
				{href}
			</Text>
		</Section>
	);
};

export { EmailButton };
