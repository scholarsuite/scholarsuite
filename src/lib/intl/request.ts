import { getRequestConfig } from "next-intl/server";
import { defaultLocale } from "./config.ts";
import { getUserLocale } from "./utils.ts";

export default getRequestConfig(async () => {
	const locale = await getUserLocale();

	const selectedMessages = await import(
		`../../../locales/${locale}.json`
	).catch(() => null);

	if (!selectedMessages) {
		return {
			locale: defaultLocale,
			messages: (await import(`../../../locales/${defaultLocale}.json`))
				.default,
		};
	}

	return {
		locale,
		messages: selectedMessages.default,
	};
});
