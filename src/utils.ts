const capitalize = (s: string): string =>
	s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);

export { capitalize };
