/** RFC 4180: quote a field only when it contains a delimiter, quote, or newline. */
const NEEDS_QUOTING = /[",\r\n]/;

const escapeCsvValue = (value: string): string =>
	NEEDS_QUOTING.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

const toCsv = (rows: string[][]): string =>
	rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");

/**
 * Leading BOM so spreadsheet apps detect UTF-8 rather than guessing a legacy
 * codepage and mangling non-ASCII item names.
 */
const UTF8_BOM = "﻿";

const downloadCsv = (filename: string, csv: string): void => {
	const blob = new Blob([UTF8_BOM, csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};

export { downloadCsv, toCsv };
