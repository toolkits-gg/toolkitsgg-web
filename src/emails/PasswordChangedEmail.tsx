import { Link, Text } from "react-email";
import { EmailLayout } from "#/emails/EmailLayout.tsx";
import { clientEnv } from "#/env/client-env.ts";

type PasswordChangedEmailProps = {
	toName: string;
	url: string;
};

const PasswordChangedEmail = ({ toName, url }: PasswordChangedEmailProps) => {
	const appName = clientEnv.VITE_APP_NAME;

	return (
		<EmailLayout
			preview={`The password for your ${appName} account was changed`}
			heading="Your password was changed"
		>
			<Text className="mt-4 text-gray-700 text-sm leading-6">
				Hi {toName}, the password for your {appName} account was just changed.
				If this was you, no further action is needed.
			</Text>

			<Text className="mt-4 text-gray-700 text-sm leading-6">
				If this was not you, someone else may have access to your account.{" "}
				<Link href={url} className="text-brand underline">
					Reset your password
				</Link>{" "}
				right away to lock it back down.
			</Text>
		</EmailLayout>
	);
};

PasswordChangedEmail.PreviewProps = {
	toName: "TK",
	url: "http://localhost:3000/forgot-password",
} as PasswordChangedEmailProps;

export default PasswordChangedEmail;
export { PasswordChangedEmail };
