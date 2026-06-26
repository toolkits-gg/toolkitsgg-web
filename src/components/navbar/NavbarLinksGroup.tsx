import { Box, Collapse, Group, ThemeIcon, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { LuChevronRight } from "react-icons/lu";
import type { NavLinkSubLink } from "#/components/navbar/get-nav-links";
import classes from "./NavbarLinksGroup.module.css";

interface NavbarLinksGroupProps {
	// biome-ignore lint/suspicious/noExplicitAny: <Need to allow any type of icon component>
	icon: FC<any> | undefined;
	label: string;
	initiallyOpened?: boolean;
	links?: NavLinkSubLink[];
}

const NavbarLinksGroup = ({
	icon: Icon,
	label,
	initiallyOpened,
	links,
}: NavbarLinksGroupProps) => {
	const hasLinks = Array.isArray(links);
	const [expanded, handlers] = useDisclosure(initiallyOpened || false);

	const items = (hasLinks ? links : []).map((link) => {
		if (link.onClick) {
			return (
				<UnstyledButton
					className={classes.link}
					onClick={link.onClick}
					key={link.label}
					data-wizard-target={link.dataWizardTarget}
				>
					{link.label}
				</UnstyledButton>
			);
		}

		return (
			<Link
				className={classes.link}
				to={link.link || "#"}
				key={link.label}
				data-wizard-target={link.dataWizardTarget}
			>
				{link.label}
			</Link>
		);
	});

	return (
		<>
			<UnstyledButton onClick={handlers.toggle} className={classes.control}>
				<Group justify="space-between" gap={0}>
					<Box style={{ display: "flex", alignItems: "center" }}>
						{Icon && (
							<ThemeIcon variant="filled" color="primary.5" size={30}>
								<Icon size={18} />
							</ThemeIcon>
						)}
						<Box ml="md" className={classes.label}>
							{label}
						</Box>
					</Box>
					{hasLinks && (
						<LuChevronRight
							className={classes.chevron}
							size={16}
							style={{ transform: expanded ? "rotate(-90deg)" : "none" }}
						/>
					)}
				</Group>
			</UnstyledButton>
			{hasLinks ? (
				<Collapse expanded={expanded}>
					<Box className={classes.linksWrapper}>{items}</Box>
				</Collapse>
			) : null}
		</>
	);
};

export { NavbarLinksGroup };
