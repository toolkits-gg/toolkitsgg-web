import { Box } from "@mantine/core";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";

import type { WizardStep } from "#/features/wizard/types";

import { WizardContent } from "./WizardContent";
import { WizardOverlay } from "./WizardOverlay";

type WizardProps = {
	steps: WizardStep[];
	opened: boolean;
	onClose: () => void;
	localStorageKeyPrefix: string;
	onStepChange?: (stepId: string | null) => void;
	onBeforeOpen?: () => void | Promise<void>;
	mobileBreakpoint?: number;
};

const Wizard = ({
	steps,
	opened,
	onClose,
	localStorageKeyPrefix,
	onStepChange,
	onBeforeOpen,
	mobileBreakpoint = 768,
}: WizardProps) => {
	const [isReady, setIsReady] = useState(false);
	const [position, setPosition] = useState<"top" | "middle" | "bottom">(
		"bottom",
	);
	const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);

	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [_hasCompleted, setHasCompleted] = useLocalStorage({
		key: `${localStorageKeyPrefix}-completed`,
		defaultValue: false,
	});

	const currentStep = steps[currentStepIndex];
	const isLastStep = currentStepIndex === steps.length - 1;
	const isFirstStep = currentStepIndex === 0;

	const resetWizard = (completed: boolean = true) => {
		setCurrentStepIndex(0);
		setHasCompleted(completed);
	};

	const handleNextStep = () => {
		if (isLastStep) {
			resetWizard();
			onClose();
		} else {
			setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
		}
	};

	const handlePreviousStep = () => {
		setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
	};

	const handleCloseWizard = () => {
		resetWizard();
		onClose();
	};

	useEffect(() => {
		const openWizard = async () => {
			setIsReady(false);

			if (onBeforeOpen) {
				await onBeforeOpen();
			}

			// Small delay to allow any animations or navigation to settle
			const timer = setTimeout(() => {
				setIsReady(true);
			}, 100);

			return () => clearTimeout(timer);
		};

		if (!opened) return;

		openWizard().then(() => {
			// placeholder - no action needed
		});
	}, [opened, onBeforeOpen]);

	useEffect(() => {
		const stepChange = () => {
			if (opened && onStepChange) {
				onStepChange(currentStep.id);
			}
			if (!opened && onStepChange) {
				onStepChange(null);
			}
		};
		stepChange();
	}, [opened, currentStep.id, onStepChange]);

	// Determine wizard control position based on target element
	useEffect(() => {
		if (!isReady || !currentStep.targetSelector) {
			return;
		}

		const checkPosition = () => {
			if (!currentStep.targetSelector) return;

			const targetElement = document.querySelector(currentStep.targetSelector);
			if (targetElement) {
				const rect = targetElement.getBoundingClientRect();
				const windowHeight = window.innerHeight;
				const isInLowerHalf = rect.top > windowHeight / 2;

				// On mobile, use top position to avoid overlap with navbar elements
				// On desktop/tablet, use middle position for better visibility
				if (isInLowerHalf) {
					setPosition(isMobile ? "top" : "middle");
				} else {
					setPosition("bottom");
				}
			}
		};

		checkPosition();
		window.addEventListener("resize", checkPosition);

		return () => {
			window.removeEventListener("resize", checkPosition);
		};
	}, [isReady, currentStep.targetSelector, isMobile]);

	if (!opened || !isReady) {
		return null;
	}

	return (
		<>
			{currentStep.targetSelector && (
				<WizardOverlay
					targetSelector={currentStep.targetSelector}
					spotlightPadding={8}
				/>
			)}
			{!currentStep.targetSelector && (
				<Box
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0, 0, 0, 0.4)",
						zIndex: "var(--mantine-z-index-overlay)",
						pointerEvents: "none",
					}}
				/>
			)}
			<WizardContent
				step={currentStep}
				onNext={handleNextStep}
				onPrevious={handlePreviousStep}
				onExit={handleCloseWizard}
				isLastStep={isLastStep}
				isFirstStep={isFirstStep}
				position={position}
				currentStepIndex={currentStepIndex}
				totalSteps={steps.length}
			/>
		</>
	);
};

export { Wizard, type WizardProps };
