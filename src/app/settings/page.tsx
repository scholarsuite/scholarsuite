import { headers } from "next/headers";
import LanguageSelector from "#components/Settings/LanguageSelector.tsx";
import ThemeSwitcher from "#components/Settings/ThemeSwitcher.tsx";
import { auth } from "#lib/auth.ts";

export default async function SettingsPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	return (
		<div className="max-w-3xl mx-auto py-12 px-4">
			<h1 className="text-2xl font-bold mb-6">Settings</h1>
			<div className="space-y-6">
				<ThemeSwitcher />
				<LanguageSelector
					initial={session?.user?.preferredLanguage ?? undefined}
				/>
			</div>
		</div>
	);
}
