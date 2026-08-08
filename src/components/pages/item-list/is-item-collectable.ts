const isItemCollectable = (
	category: unknown,
	uncollectableCategories: readonly unknown[],
): boolean =>
	!uncollectableCategories.some(
		(uc) => String(category).toLowerCase() === String(uc).toLowerCase(),
	);

export { isItemCollectable };
