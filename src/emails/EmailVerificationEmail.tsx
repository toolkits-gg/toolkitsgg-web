import { Text } from "react-email";
import { EmailButton } from "#/emails/EmailButton.tsx";
import { EmailLayout } from "#/emails/EmailLayout.tsx";
import { clientEnv } from "#/env/client-env.ts";

type EmailVerificationEmailProps = {
	toName: string;
	url: string;
};

const EmailVerificationEmail = ({
	toName,
	url,
}: EmailVerificationEmailProps) => {
	const appName = clientEnv.VITE_APP_NAME;

	return (
		<EmailLayout
			preview={`Confirm your address to finish setting up your ${appName} account`}
			heading="Verify your email"
		>
			<Text className="mt-4 text-gray-700 text-sm leading-6">
				Hi {toName}, welcome to {appName}. Confirm this address and your account
				is ready to use.
			</Text>

			<EmailButton href={url} label="Verify email" />

			<Text className="mt-6 mb-0 text-gray-500 text-xs leading-5">
				This link expires in one hour. If you did not create a {appName}
				account, you can ignore this email.
			</Text>
		</EmailLayout>
	);
};

EmailVerificationEmail.PreviewProps = {
	toName: "TK",
	url: "http://localhost:3000/api/auth/verify-email?token=abc123&callbackURL=%2Fverify-email",
} as EmailVerificationEmailProps;

export default EmailVerificationEmail;
export { EmailVerificationEmail };
