import { Box } from "@mantine/core";
import { useEffect, useState } from "react";

import classes from "./WizardOverlay.module.css";

type WizardOverlayProps = {
	targetSelector: string;
	spotlightPadding?: number;
};

const WizardOverlay = ({
	targetSelector,
	spotlightPadding = 4,
}: WizardOverlayProps) => {
	const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

	useEffect(() => {
		const updateSpotlight = () => {
			const targetElement = document.querySelector(targetSelector);
			if (targetElement) {
				const rect = targetElement.getBoundingClientRect();
				setSpotlightRect(rect);
			}
		};

		// Initial calculation
		updateSpotlight();

		window.addEventListener("resize", updateSpotlight);
		window.addEventListener("scroll", updateSpotlight);

		return () => {
			window.removeEventListener("resize", updateSpotlight);
			window.removeEventListener("scroll", updateSpotlight);
		};
	}, [targetSelector]);

	if (!spotlightRect) {
		return null;
	}

	return (
		<Box
			className={classes.spotlight}
			style={{
				top: spotlightRect.top - spotlightPadding,
				left: spotlightRect.left - spotlightPadding,
				width: spotlightRect.width + spotlightPadding * 2,
				height: spotlightRect.height + spotlightPadding * 2,
			}}
		/>
	);
};

export { WizardOverlay };
