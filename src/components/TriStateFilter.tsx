import {
	Checkbox,
	CloseButton,
	Group,
	Pill,
	Popover,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { useState } from "react";
import classes from "./TriStateFilter.module.css";

type TriStateValue = "include" | "exclude" | "default";

export type TriStateFilterValue = Record<string, TriStateValue>;

export type AppTriStateFilterProps = {
	label: string;
	options: Record<string, string>;
	value: TriStateFilterValue;
	onChange: (value: TriStateFilterValue) => void;
	placeholder?: string;
};

export const TriStateFilter = ({
	label,
	options,
	value,
	onChange,
	placeholder,
}: AppTriStateFilterProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [opened, setOpened] = useState(false);

	const optionKeys = Object.keys(options);

	const getDisplayLabel = (optionKey: string): string => {
		return options[optionKey] ?? optionKey;
	};

	const filteredOptions = searchQuery
		? optionKeys.filter((optionKey) =>
				getDisplayLabel(optionKey)
					.toLowerCase()
					.includes(searchQuery.toLowerCase()),
			)
		: optionKeys;

	const handleOptionClick = (option: string) => {
		const currentState = value[option] || "default";
		let newState: TriStateValue;

		if (currentState === "default") {
			newState = "include";
		} else if (currentState === "include") {
			newState = "exclude";
		} else {
			newState = "default";
		}

		const newValue = { ...value };
		if (newState === "default") {
			delete newValue[option];
		} else {
			newValue[option] = newState;
		}

		onChange(newValue);
	};

	const getCheckboxState = (
		option: string,
	): { checked: boolean; indeterminate: boolean; color?: string } => {
		const state = value[option] || "default";
		if (state === "include") {
			return { checked: true, indeterminate: false, color: "success" };
		}
		if (state === "exclude") {
			return { checked: true, indeterminate: false, color: "error" };
		}
		return { checked: false, indeterminate: false };
	};

	const includedItems = Object.entries(value)
		.filter(([, state]) => state === "include")
		.map(([name]) => name);
	const excludedItems = Object.entries(value)
		.filter(([, state]) => state === "exclude")
		.map(([name]) => name);
	const totalActive = includedItems.length + excludedItems.length;

	const clearAll = () => {
		onChange({});
	};

	const removeItem = (itemName: string) => {
		const newValue = { ...value };
		delete newValue[itemName];
		onChange(newValue);
	};

	return (
		<Stack gap="2xs">
			<Popover
				width="target"
				position="bottom-start"
				opened={opened}
				onChange={setOpened}
			>
				<Popover.Target>
					<div>
						<Text size="sm" fw={500} mb="2xs">
							{label}
						</Text>
						{/** biome-ignore lint/a11y/useSemanticElements: <Popover is a button, cannot nest button in button> */}
						<div
							role="button"
							tabIndex={0}
							className={classes.input}
							onClick={() => setOpened((o) => !o)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setOpened((o) => !o);
								}
							}}
						>
							{totalActive === 0 ? (
								<Text size="sm" c="dimmed">
									{placeholder || `Select ${label.toLowerCase()}`}
								</Text>
							) : (
								<Group gap="2xs" wrap="wrap">
									{includedItems.map((item) => (
										<Pill
											key={item}
											withRemoveButton
											onRemove={() => removeItem(item)}
											classNames={{
												root: classes.pillInclude,
												remove: classes.pillRemove,
											}}
											size="xs"
										>
											{getDisplayLabel(item)}
										</Pill>
									))}
									{excludedItems.map((item) => (
										<Pill
											key={item}
											withRemoveButton
											onRemove={() => removeItem(item)}
											classNames={{
												root: classes.pillExclude,
												remove: classes.pillRemove,
											}}
											size="xs"
										>
											{getDisplayLabel(item)}
										</Pill>
									))}
								</Group>
							)}
						</div>
					</div>
				</Popover.Target>

				<Popover.Dropdown>
					<Stack gap="2xs">
						<Group justify="space-between" align="center" gap="2xs">
							<TextInput
								placeholder="Search..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.currentTarget.value)}
								size="xs"
								style={{ flex: 1 }}
							/>
							<Group gap="2xs">
								{totalActive > 0 && (
									<Text
										size="xs"
										c="error"
										style={{ cursor: "pointer" }}
										onClick={clearAll}
									>
										Clear all
									</Text>
								)}
								<CloseButton
									size="sm"
									onClick={() => setOpened(false)}
									aria-label="Close filter"
								/>
							</Group>
						</Group>

						<Stack
							gap="3xs"
							style={{
								maxHeight: "250px",
								overflowY: "auto",
							}}
						>
							{filteredOptions.map((option) => {
								const checkboxState = getCheckboxState(option);
								const state = value[option] || "default";

								return (
									<button
										key={option}
										type="button"
										onClick={() => handleOptionClick(option)}
										className={`${classes.option} ${state !== "default" ? classes.optionActive : ""}`}
									>
										<Checkbox
											label={getDisplayLabel(option)}
											checked={checkboxState.checked}
											indeterminate={checkboxState.indeterminate}
											color={checkboxState.color}
											onChange={() => {}}
											style={{ pointerEvents: "none" }}
											size="xs"
										/>
									</button>
								);
							})}
						</Stack>

						<Text size="xs" c="dimmed" p="2xs" className={classes.hint}>
							Click once: include (green) • Click twice: exclude (red) • Click
							thrice: reset
						</Text>
					</Stack>
				</Popover.Dropdown>
			</Popover>
		</Stack>
	);
};
