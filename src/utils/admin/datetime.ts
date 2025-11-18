export function formatTimeInput(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(Number(date))) {
		return "";
	}
	return date.toISOString().slice(0, 16);
}
