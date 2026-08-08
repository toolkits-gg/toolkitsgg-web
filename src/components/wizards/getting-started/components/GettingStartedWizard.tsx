import { useMediaQuery } from "@mantine/hooks";
import { LOCALSTORAGE_KEY_PREFIX } from "#/components/wizards/getting-started/constants/localstorage-keys";
import { GETTING_STARTED_STEPS } from "#/components/wizards/getting-started/constants/steps";
import { useGameId } from "#/features/game/use-game-id";
import type { WizardStep } from "#/features/wizard/types";
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

	// The heart icon this step points at only exists on a game page.
	const isStepApplicable = (step: WizardStep) =>
		step.id !== "favorite-game" || Boolean(gameId);

	// The open drawer covers the footer, so there is nothing to spotlight.
	const hasHiddenTarget = (step: WizardStep) =>
		isMobile && step.id === "social-media";

	const adaptedSteps = GETTING_STARTED_STEPS.filter(isStepApplicable).map(
		(step) =>
			hasHiddenTarget(step) ? { ...step, targetSelector: undefined } : step,
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
