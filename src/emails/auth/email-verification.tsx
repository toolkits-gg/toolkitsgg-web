import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Section,
	Tailwind,
	Text,
} from "react-email";

type EmailVerificationProps = {
	toName: string;
	url: string;
};

const EmailVerification = ({ toName, url }: EmailVerificationProps) => {
	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="m-8 text-center font-sans">
					<Container>
						<Section>
							<Text>
								Hello {toName}, welcome to {import.meta.env.VITE_APP_NAME}!
								Please verify your email address by clicking the button below.
							</Text>
						</Section>
						<Section>
							<Button
								href={url}
								className="m-2 rounded bg-black p-2 text-white"
							>
								Verify Email
							</Button>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

EmailVerification.PreviewProps = {
	toName: "TK",
	url: "http://localhost:3000/verify-email/abc123",
} as EmailVerificationProps;

export { EmailVerification };
