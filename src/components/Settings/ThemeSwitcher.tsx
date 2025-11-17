"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card } from "#components/Common/Card.tsx";
import { Select } from "#components/Common/Select.tsx";

export default function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	return (
		<Card className="p-6">
			<div className="space-y-2">
				<Select<string>
					values={["system", "light", "dark"]}
					defaultValue={theme ?? "system"}
					onChange={(v) => setTheme(v)}
					placeholder="Choisir le thème"
					label="Thème"
					className="w-full"
				/>
			</div>
		</Card>
	);
}
