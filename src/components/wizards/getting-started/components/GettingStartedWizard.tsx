import { useMediaQuery } from "@mantine/hooks";
import { LOCALSTORAGE_KEY_PREFIX } from "#/components/wizards/getting-started/constants/localstorage-keys";
import { GETTING_STARTED_STEPS } from "#/components/wizards/getting-started/constants/steps";
import { useGameId } from "#/features/game/core/use-game-id";
import { Wizard } from "#/features/wizard/Wizard";

type GettingStartedWizardProps = {
	navbarOpened: boolean;
	opened: boolean;
	onClose: () => void;
	onStepChange?: (stepId: string | null) => void;
	toggleNavbar: () => void;
};

const GettingStartedWizard = ({
	opened,
	navbarOpened,
	onStepChange,
	onClose,

	toggleNavbar,
}: GettingStartedWizardProps) => {
	const gameId = useGameId();

	const isMobile = useMediaQuery("(max-width: 768px)");

	const adaptedSteps = GETTING_STARTED_STEPS.reduce<typeof GETTING_STARTED_STEPS>(
		(acc, step) => {
			// if no gameId, remove the favorite-game slide since the
			// favorite game heart icon is not visible
			if (step.id === "favorite-game" && !gameId) {
				return acc;
			}

			// On mobile, remove targetSelector for social-media step since
			// the footer is not visible with the drawer open
			if (isMobile && step.id === "social-media") {
				acc.push({ ...step, targetSelector: undefined });
			} else {
				acc.push(step);
			}

			return acc;
		},
		[],
	);

	const handleBeforeOpen = () => {
		if (isMobile && !navbarOpened) {
			toggleNavbar();
		}
	};

	return (
		<Wizard
			steps={adaptedSteps}
			opened={opened}
			onClose={onClose}
			localStorageKeyPrefix={LOCALSTORAGE_KEY_PREFIX}
			onStepChange={onStepChange}
			onBeforeOpen={handleBeforeOpen}
			mobileBreakpoint={768}
		/>
	);
};

export { GettingStartedWizard };
