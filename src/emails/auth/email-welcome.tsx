import { Text } from "react-email";
import { EmailButton } from "#/emails/_components/EmailButton";
import { EmailLayout } from "#/emails/_components/EmailLayout";
import { clientEnv } from "#/env/client-env";

type EmailWelcomeProps = {
	toName: string;
	url: string;
};

const EmailWelcome = ({ toName, url }: EmailWelcomeProps) => {
	const appName = clientEnv.VITE_APP_NAME;

	return (
		<EmailLayout
			preview={`Your ${appName} account is verified and ready`}
			heading={`Welcome to ${appName}`}
		>
			<Text className="mt-4 text-gray-700 text-sm leading-6">
				Hi {toName}, your email is verified and your account is ready. {appName}{" "}
				is an open-source, ad-free home for item collection tracking and build
				planning across a growing set of games.
			</Text>

			<Text className="mt-4 text-gray-700 text-sm leading-6">
				Pick a game to get started, track what you have collected, and save
				builds you can share with a link.
			</Text>

			<EmailButton href={url} label="Choose a game" />
		</EmailLayout>
	);
};

EmailWelcome.PreviewProps = {
	toName: "TK",
	url: "http://localhost:3000/",
} as EmailWelcomeProps;

export default EmailWelcome;
export { EmailWelcome };
