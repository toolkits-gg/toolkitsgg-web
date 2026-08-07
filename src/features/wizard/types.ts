import type { ReactNode } from "react";

type WizardStep = {
	id: string;
	targetSelector?: string;
	title: string;
	description: string;
	customContent?: ReactNode;
};

export type { WizardStep };
