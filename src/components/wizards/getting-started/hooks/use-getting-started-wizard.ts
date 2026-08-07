import { useDisclosure, useLocalStorage, useMounted } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { LOCALSTORAGE_KEYS } from "#/components/wizards/getting-started/constants/localstorage-keys";

/**
 * Hook to
 */
const useGettingStartedWizard = () => {
	const mounted = useMounted();

	const [wizardOpened, { open: openWizard, close: closeWizard }] =
		useDisclosure();

	const [wizardHasCompleted] = useLocalStorage({
		key: LOCALSTORAGE_KEYS.HAS_COMPLETED,
		defaultValue: false,
	});

	const [currentWizardStepId, setCurrentWizardStepId] = useState<string | null>(
		null,
	);

	useEffect(() => {
		if (!mounted) return;

		if (!wizardHasCompleted) {
			openWizard();
		}
	}, [mounted, wizardHasCompleted, openWizard]);

	return {
		currentWizardStepId,
		wizardOpened,
		openWizard,
		closeWizard,
		setCurrentWizardStepId,
	};
};

export { useGettingStartedWizard };
