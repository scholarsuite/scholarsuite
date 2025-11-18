"use client";

import { useTranslations } from "next-intl";
import { tryStringify } from "#utils/json.ts";

export function MetadataViewer({ metadata }: { metadata: unknown }) {
	const t = useTranslations("app.admin.logs");

	if (metadata === null || metadata === undefined) {
		return (
			<span className="text-xs text-slate-500 dark:text-slate-400">
				{t("noMetadata")}
			</span>
		);
	}

	const result = tryStringify(metadata);

	return (
		<details className="text-xs">
			<summary className="cursor-pointer text-sky-600 transition hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200">
				{t("viewMetadata")}
			</summary>
			<pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
				{result.ok
					? result.value
					: t("unableToDisplay", { message: result.error })}
			</pre>
		</details>
	);
}
