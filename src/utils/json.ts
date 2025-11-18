export function tryStringify(
	value: unknown,
): { ok: true; value: string } | { ok: false; error: string } {
	if (typeof value === "string") {
		return { ok: true, value };
	}

	try {
		return { ok: true, value: JSON.stringify(value, null, 2) };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return { ok: false, error: message };
	}
}
