"use client";

import { useEffect, useState } from "react";
import { Card } from "#components/Common/Card.tsx";
import { Select } from "#components/Common/Select.tsx";
import { defaultLocale, locales } from "#lib/intl/config.ts";
import { saveUserPreferences } from "#lib/user-settings.ts";

export default function LanguageSelector({ initial }: { initial?: string }) {
	const [lang, setLang] = useState<string>(initial ?? defaultLocale);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setLang(initial ?? defaultLocale);
	}, [initial]);

	const handleChange = async (value: string) => {
		setLang(value);
		try {
			setSaving(true);
			await saveUserPreferences({ preferredLanguage: value });
		} finally {
			setSaving(false);
			try {
				localStorage.setItem("preferredLanguage", value);
			} catch {}
		}
	};

	return (
		<Card className="p-6">
			<div className="space-y-2">
				<Select<string>
					values={[...locales]}
					defaultValue={lang}
					onChange={handleChange}
					placeholder="Choisir une langue"
					label="Langue"
					className="w-full"
				/>

				{saving && (
					<p className="text-xs text-slate-500 dark:text-white/70">
						Enregistrement…
					</p>
				)}
			</div>
		</Card>
	);
}
