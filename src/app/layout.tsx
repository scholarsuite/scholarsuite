import "#styles/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import ThemeProviderClient from "#providers/ThemeClient.tsx";

export default async function RootLayout({
	children,
}: {
	children: ReactNode;
}) {
	const locale = await getLocale();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body>
				<NextIntlClientProvider>
					<ThemeProviderClient>{children}</ThemeProviderClient>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
