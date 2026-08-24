import { Text } from "react-email";
import { EmailButton } from "#/emails/EmailButton.tsx";
import { EmailLayout } from "#/emails/EmailLayout.tsx";
import { clientEnv } from "#/env/client-env.ts";

type WelcomeEmailProps = {
	toName: string;
	url: string;
};

const WelcomeEmail = ({ toName, url }: WelcomeEmailProps) => {
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

WelcomeEmail.PreviewProps = {
	toName: "TK",
	url: "http://localhost:3000/",
} as WelcomeEmailProps;

export default WelcomeEmail;
export { WelcomeEmail };
