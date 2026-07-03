import { Select } from "@mantine/core";
import { useRef, useState } from "react";
import { useGameId } from "#/features/game/use-game-id.ts";
import { getGameItems } from "#/registry/game-public-registry.tsx";;

export type ItemSearchInputProps = {
	searchValue: string;
	onSearchChange: (query: string) => void;
	onLoadingChange?: (loading: boolean) => void;
};

export const ItemSearchInput = ({
	searchValue,
	onSearchChange,
	onLoadingChange,
}: ItemSearchInputProps) => {
	const timeoutRef = useRef<number>(-1);
	const [value, setValue] = useState(searchValue);
	const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
	const [loading, setLoading] = useState(false);

	if (searchValue !== prevSearchValue) {
		setPrevSearchValue(searchValue);
		setValue(searchValue);
	}

	const gameId = useGameId();
	const items = getGameItems(gameId);

	const data = items
		? items.categories.map((category) => ({
				group: category,
				items: items.all
					.filter((item) => item.category === category)
					.map((item) => ({
						label: item.name,
						value: item.id,
					})),
			}))
		: [];

	const handleSearchChange = (query: string) => {
		window.clearTimeout(timeoutRef.current);
		setValue(query);

		if (query.trim() === value.trim()) return;

		setLoading(true);
		onLoadingChange?.(true);

		timeoutRef.current = window.setTimeout(() => {
			onSearchChange(query);
			setLoading(false);
			onLoadingChange?.(false);
		}, 500);
	};

	return (
		<Select
			searchable
			clearable
			searchValue={value}
			onSearchChange={handleSearchChange}
			loading={loading}
			placeholder="Search for an item"
			data={data}
			nothingFoundMessage="No items found"
			comboboxProps={{ transitionProps: { transition: "pop", duration: 200 } }}
			w="100%"
		/>
	);
};
