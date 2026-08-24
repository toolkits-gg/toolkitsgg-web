import { Text } from "react-email";
import { EmailButton } from "#/emails/EmailButton.tsx";
import { EmailLayout } from "#/emails/EmailLayout.tsx";
import { clientEnv } from "#/env/client-env.ts";

type PasswordResetEmailProps = {
	toName: string;
	url: string;
};

const PasswordResetEmail = ({ toName, url }: PasswordResetEmailProps) => {
	const appName = clientEnv.VITE_APP_NAME;

	return (
		<EmailLayout
			preview={`Reset the password for your ${appName} account`}
			heading="Reset your password"
		>
			<Text className="mt-4 text-gray-700 text-sm leading-6">
				Hi {toName}, we received a request to reset the password for your{" "}
				{appName} account. Choose a new one using the button below.
			</Text>

			<EmailButton href={url} label="Reset password" />

			<Text className="mt-6 mb-0 text-gray-500 text-xs leading-5">
				This link expires in one hour and can only be used once. If you did not
				request a reset, ignore this email; your password will not change.
			</Text>
		</EmailLayout>
	);
};

PasswordResetEmail.PreviewProps = {
	toName: "TK",
	url: "http://localhost:3000/api/auth/reset-password/abc123?callbackURL=%2Freset-password",
} as PasswordResetEmailProps;

export default PasswordResetEmail;
export { PasswordResetEmail };
