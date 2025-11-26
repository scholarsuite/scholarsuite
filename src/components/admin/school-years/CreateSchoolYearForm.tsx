"use client";

import { useTranslations } from "next-intl";
import type { FC } from "react";
import { useState } from "react";
import { Button } from "#components/Common/Button.tsx";
import { Input } from "#components/Common/Input.tsx";

type CreateSchoolYearFormProps = {
	onSubmit: (payload: {
		label: string;
		startsAt: string;
		endsAt: string;
		levels: string[];
	}) => Promise<void>;
	onCancel: () => void;
	isSubmitting: boolean;
};

export const CreateSchoolYearForm: FC<CreateSchoolYearFormProps> = ({
	onSubmit,
	onCancel,
	isSubmitting,
}) => {
	const t = useTranslations("app.admin.schoolYears");
	const [form, setForm] = useState({
		label: "",
		startsAt: "",
		endsAt: "",
		levelsRaw: "",
	});
	const [error, setError] = useState<string | null>(null);

	const submit = async () => {
		const trimmedLabel = form.label.trim();
		if (!trimmedLabel) {
			setError(t("creation.errors.labelRequired"));
			return;
		}
		if (!form.startsAt || !form.endsAt) {
			setError(t("creation.errors.datesRequired"));
			return;
		}
		const startDate = new Date(form.startsAt);
		const endDate = new Date(form.endsAt);
		if (
			Number.isNaN(startDate.getTime()) ||
			Number.isNaN(endDate.getTime()) ||
			startDate > endDate
		) {
			setError(t("creation.errors.invalidDateRange"));
			return;
		}

		const levels = form.levelsRaw
			.split(",")
			.map((level) => level.trim())
			.filter(Boolean);

		try {
			await onSubmit({
				label: trimmedLabel,
				startsAt: startDate.toISOString(),
				endsAt: endDate.toISOString(),
				levels,
			});
		} catch {
			// Parent component surfaces API errors through the shared alert box.
		}
	};

	return (
		<section className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
			<header className="space-y-2">
				<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
					{t("creation.title")}
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-300">
					{t("creation.description")}
				</p>
			</header>

			{error ? (
				<p className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
					{error}
				</p>
			) : null}

			<div className="grid gap-4 md:grid-cols-2">
				<Input
					value={form.label}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, label: event.target.value }))
					}
					placeholder={t("creation.labelPlaceholder")}
					required
				/>
				<Input
					type="date"
					value={form.startsAt}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, startsAt: event.target.value }))
					}
					placeholder={t("creation.startDate")}
					required
				/>
				<Input
					type="date"
					value={form.endsAt}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, endsAt: event.target.value }))
					}
					placeholder={t("creation.endDate")}
					required
				/>
				<Input
					value={form.levelsRaw}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, levelsRaw: event.target.value }))
					}
					placeholder={t("creation.levelsPlaceholder")}
					description={t("creation.levelsDescription")}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Button
					type="button"
					onClick={() => void submit()}
					disabled={isSubmitting}
				>
					{t("creation.submit")}
				</Button>
				<button
					type="button"
					onClick={onCancel}
					disabled={isSubmitting}
					className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-800 hover:underline dark:text-slate-300 dark:hover:text-white"
				>
					{t("creation.cancel")}
				</button>
			</div>
		</section>
	);
};
