import { Box, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";

import type { WizardStep } from "#/features/wizard/types";

type WizardContentProps = {
	step: WizardStep;
	onNext: () => void;
	onPrevious: () => void;
	onExit: () => void;
	isLastStep: boolean;
	isFirstStep: boolean;
	position?: "top" | "middle" | "bottom";
	currentStepIndex: number;
	totalSteps: number;
};

const WizardContent = ({
	step,
	onNext,
	onPrevious,
	onExit,
	isLastStep,
	isFirstStep,
	position = "bottom",
	currentStepIndex,
	totalSteps,
}: WizardContentProps) => {
	const getPositionStyles = () => {
		switch (position) {
			case "top":
				return {
					top: 24,
					left: "50%",
					transform: "translateX(-50%)",
				};
			case "middle":
				return {
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
				};
			default:
				return {
					bottom: 24,
					left: "50%",
					transform: "translateX(-50%)",
				};
		}
	};

	return (
		<Paper
			shadow="xl"
			p="lg"
			radius="md"
			withBorder
			bg="light-dark(var(--mantine-color-card-5), var(--mantine-color-card-7))"
			c="cardFg.5"
			style={{
				position: "fixed",
				...getPositionStyles(),
				zIndex: "calc(var(--mantine-z-index-overlay) + 1)",
				maxWidth: "600px",
				width: "calc(100% - 32px)",
			}}
		>
			<Stack gap="md">
				<Box>
					<Group justify="space-between" align="flex-start" mb="xs">
						<Title order={3} size="h4" c="primary.5">
							{step.title}
						</Title>
						<Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
							{currentStepIndex + 1} / {totalSteps}
						</Text>
					</Group>
					{step.description && (
						<Text size="sm" c="cardFg.5">
							{step.description}
						</Text>
					)}
				</Box>

				{step.customContent && <div>{step.customContent}</div>}

				<Group justify="flex-end" align="center">
					<Button
						variant="default"
						onClick={onPrevious}
						size="sm"
						disabled={isFirstStep}
					>
						Previous
					</Button>
					<Button variant="subtle" onClick={onExit} size="sm">
						Exit
					</Button>
					<Button onClick={onNext} size="sm">
						{isLastStep ? "Finish" : "Next"}
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
};

export { WizardContent, type WizardContentProps };
