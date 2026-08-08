import type { IconType } from "react-icons";
import { SiDiscord, SiReddit } from "react-icons/si";

type SocialProvider = {
	id: "discord" | "reddit";
	label: string;
	Icon: IconType;
	/** Set when the button itself is unbranded and the icon carries the color. */
	iconColor?: string;
	buttonColor?: string;
};

const SOCIAL_PROVIDERS: readonly SocialProvider[] = [
	{
		id: "discord",
		label: "Discord",
		Icon: SiDiscord,
		buttonColor: "secondary.5",
	},
	{ id: "reddit", label: "Reddit", Icon: SiReddit, iconColor: "#FF4500" },
];

const socialProviderLabel = (providerId: string) =>
	SOCIAL_PROVIDERS.find((provider) => provider.id === providerId)?.label;

export type { SocialProvider };
export { SOCIAL_PROVIDERS, socialProviderLabel };
