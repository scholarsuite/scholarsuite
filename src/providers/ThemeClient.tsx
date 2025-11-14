"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProviderClient({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			themes={["light", "dark"]}
		>
			{children}
		</ThemeProvider>
	);
}
