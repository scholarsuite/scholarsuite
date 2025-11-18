export function formatRelative(timestamp: string, locale: string): string {
	const date = new Date(timestamp);
	const diff = Date.now() - date.getTime();
	const abs = Math.abs(diff);
	const minute = 60_000;
	const hour = 60 * minute;
	const day = 24 * hour;

	// Use Intl.RelativeTimeFormat for localized output
	const rtf = new Intl.RelativeTimeFormat(locale, {
		numeric: "auto",
		style: "short",
	});

	if (abs < minute) {
		const seconds = Math.max(1, Math.round(abs / 1_000));
		return rtf.format(-seconds, "second");
	}

	if (abs < hour) {
		const minutes = Math.round(abs / minute);
		return rtf.format(-minutes, "minute");
	}

	if (abs < day) {
		const hours = Math.round(abs / hour);
		return rtf.format(-hours, "hour");
	}

	const days = Math.round(abs / day);
	return rtf.format(-days, "day");
}
