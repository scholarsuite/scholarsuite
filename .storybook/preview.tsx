import type { Preview } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import messages from "../locales/en.json";
import "#styles/globals.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	globalTypes: {
		theme: {
			name: "Theme",
			description: "Global theme for components",
			defaultValue: "light",
			toolbar: {
				items: ["light", "dark"],
				showName: true,
				dynamicTitle: true,
			},
		},
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme;

			return (
				<ThemeProvider
					attribute="class"
					defaultTheme={theme}
					themes={["light", "dark"]}
					forcedTheme={theme}
					enableSystem={false}
				>
					<NextIntlClientProvider locale="en" messages={messages}>
						<Story />
					</NextIntlClientProvider>
				</ThemeProvider>
			);
		},
	],
};

export default preview;
