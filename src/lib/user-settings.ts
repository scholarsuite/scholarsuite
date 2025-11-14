export async function saveUserPreferences(data: {
	preferredLanguage?: string;
}) {
	try {
		await fetch("/api/user/preferences", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
	} catch {
		// ignore network errors; fallback to localStorage is performed by caller
	}
}
