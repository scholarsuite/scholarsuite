import { headers } from "next/headers";
import { auth } from "#lib/auth.ts";
import { defaultLocale, locales } from "#lib/intl/config.ts";

const normalizeLanguage = (value?: string | null): string | null => {
	if (!value) return null;
	// Take the first token (comma-separated), strip any quality (`;q=...`), then take primary subtag before `-`.
	const token = value.split(",")[0].split(";")[0].trim();
	const primary = token.split("-")[0].trim();
	return primary || null;
};

export const getUserLocale = async (): Promise<string> => {
	const headersData = await headers();
	const session = await auth.api.getSession({ headers: headersData });

	const preferred = normalizeLanguage(session?.user.preferredLanguage ?? null);
	const acceptLanguage = normalizeLanguage(headersData.get("accept-language"));

	const candidate = (preferred ??
		acceptLanguage ??
		defaultLocale) as (typeof locales)[number];
	return locales.includes(candidate) ? candidate : defaultLocale;
};
