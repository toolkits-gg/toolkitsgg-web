import { Text } from "react-email";
import { EmailButton } from "#/emails/_components/EmailButton";
import { EmailLayout } from "#/emails/_components/EmailLayout";
import { clientEnv } from "#/env/client-env";

type EmailChangeConfirmationProps = {
	toName: string;
	newEmail: string;
	url: string;
};

/**
 * Sent to the address currently on file, not the new one, so that losing control
 * of an inbox is not enough to move an account to an attacker's address.
 */
const EmailChangeConfirmation = ({
	toName,
	newEmail,
	url,
}: EmailChangeConfirmationProps) => {
	const appName = clientEnv.VITE_APP_NAME;

	return (
		<EmailLayout
			preview={`Approve the new address for your ${appName} account`}
			heading="Confirm your new email"
		>
			<Text className="mt-4 text-gray-700 text-sm leading-6">
				Hi {toName}, we received a request to change the email address on your{" "}
				{appName} account to <strong>{newEmail}</strong>. Approve the change
				using the button below.
			</Text>

			<EmailButton href={url} label="Confirm change" />

			<Text className="mt-6 mb-0 text-gray-500 text-xs leading-5">
				If you did not request this, ignore this email and your address will
				stay as it is. We sent this to your current address so that the change
				cannot be approved without you.
			</Text>
		</EmailLayout>
	);
};

EmailChangeConfirmation.PreviewProps = {
	toName: "TK",
	newEmail: "new-address@example.com",
	url: "http://localhost:3000/api/auth/verify-email?token=abc123&callbackURL=%2Faccount%2Femail",
} as EmailChangeConfirmationProps;

export default EmailChangeConfirmation;
export { EmailChangeConfirmation };
