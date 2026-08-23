import type { ReactNode } from "react";
import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";
import { CHANGELOG_URL, DISCORD_URL } from "#/constants";
import { clientEnv } from "#/env/client-env";

type EmailLayoutProps = {
	/** Inbox preview line. Kept distinct from the heading so it adds information. */
	preview: string;
	heading: string;
	children: ReactNode;
};

const BRAND_PRIMARY = "#7201d3";

const EmailLayout = ({ preview, heading, children }: EmailLayoutProps) => {
	const appName = clientEnv.VITE_APP_NAME;
	const appUrl = clientEnv.VITE_APP_URL;
	const logoUrl = `${clientEnv.VITE_CLOUDFRONT_URL}/logos/LogoToxicGreen.png`;

	return (
		<Html lang="en">
			<Head />
			<Preview>{preview}</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: { brand: BRAND_PRIMARY },
						},
					},
				}}
			>
				<Body className="bg-gray-100 py-10 font-sans">
					<Container className="mx-auto w-full max-w-[560px] rounded-lg border border-gray-200 border-solid bg-white p-8">
						<Section>
							<Link href={appUrl}>
								<Img
									src={logoUrl}
									width="48"
									height="48"
									alt={appName}
									className="mx-auto"
								/>
							</Link>
						</Section>

						<Heading className="mt-6 mb-0 text-center font-semibold text-2xl text-gray-900">
							{heading}
						</Heading>

						{children}

						<Hr className="my-8 border-gray-200" />

						<Section>
							<Text className="m-0 text-center text-gray-500 text-xs leading-5">
								<Link href={appUrl} className="text-gray-500 underline">
									{appName}
								</Link>
								{" · "}
								<Link href={DISCORD_URL} className="text-gray-500 underline">
									Discord
								</Link>
								{" · "}
								<Link href={CHANGELOG_URL} className="text-gray-500 underline">
									Changelog
								</Link>
							</Text>
							<Text className="mt-2 mb-0 text-center text-gray-400 text-xs leading-5">
								This message was sent from an unmonitored address, so replies
								will not reach us.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export { EmailLayout };
