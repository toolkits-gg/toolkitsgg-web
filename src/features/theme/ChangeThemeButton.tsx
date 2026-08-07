import { ActionIcon } from "@mantine/core";
import { modals } from "@mantine/modals";
import { LuPalette } from "react-icons/lu";

import { ThemeModal } from "#/features/theme/ThemeModal.tsx";
import type { GameId } from "@/prisma";

type ChangeThemeButtonProps = {
	gameId: GameId | undefined;
};

const ChangeThemeButton = ({ gameId }: ChangeThemeButtonProps) => {
	const handleOpenThemeModal = () => {
		modals.open({
			title: "Change theme",
			children: <ThemeModal gameId={gameId} />,
		});
	};

	return (
		<ActionIcon
			onClick={handleOpenThemeModal}
			aria-label="Theme settings"
			title="Change theme settings"
			variant="subtle"
			size="lg"
			color="primary.5"
			data-wizard-target="theme-changer"
		>
			<LuPalette />
		</ActionIcon>
	);
};

export { ChangeThemeButton };
