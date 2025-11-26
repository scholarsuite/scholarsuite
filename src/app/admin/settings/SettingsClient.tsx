"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "#components/Common/Button.tsx";
import { Input } from "#components/Common/Input.tsx";
import type { GRADE_VALUE_TYPE } from "#prisma/client";
import { formatTimeInput } from "#utils/admin/datetime.ts";
import { sortByOrder } from "#utils/admin/sort.ts";

type ConfigState = {
	schoolSettings: { id: string; schoolName: string } | null;
	levels: { id: string; label: string; order: number }[];
	coursePeriods: {
		id: string;
		label: string;
		startsAt: string;
		endsAt: string;
		order: number;
	}[];
	absenceUnits: {
		id: string;
		label: string;
		periodIds: string[];
	}[];
	subjectCategories: { id: string; label: string; order: number }[];
	subjects: {
		id: string;
		label: string;
		weight: number;
		categoryId: string | null;
		valueType: GRADE_VALUE_TYPE;
		numericMin: string | null;
		numericMax: string | null;
		numericDecimals: number | null;
		literalScale: unknown;
	}[];
};

type FetchState = "idle" | "loading" | "saving";

export function SettingsClient() {
	const t = useTranslations("app.admin.settings");

	const [config, setConfig] = useState<ConfigState | null>(null);
	const [state, setState] = useState<FetchState>("loading");
	const [error, setError] = useState<string | null>(null);

	const loadConfig = useCallback(async () => {
		setState("loading");
		setError(null);
		try {
			const response = await fetch("/api/admin/config/state", {
				credentials: "include",
				cache: "no-store",
			});

			if (!response.ok) {
				throw new Error(`Failed to load configuration (${response.status})`);
			}

			const payload = (await response.json()) as ConfigState;
			setConfig({
				schoolSettings: payload.schoolSettings,
				levels: sortByOrder(payload.levels),
				coursePeriods: sortByOrder(payload.coursePeriods),
				absenceUnits: payload.absenceUnits,
				subjectCategories: sortByOrder(payload.subjectCategories),
				subjects: payload.subjects,
			});
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Failed to load configuration",
			);
		} finally {
			setState("idle");
		}
	}, []);

	useEffect(() => {
		void loadConfig();
	}, [loadConfig]);

	const schoolName = config?.schoolSettings?.schoolName ?? "";
	const [pendingSchoolName, setPendingSchoolName] = useState("");

	useEffect(() => {
		setPendingSchoolName(schoolName);
	}, [schoolName]);

	const saveSchoolName = async () => {
		if (!pendingSchoolName.trim()) {
			setError(t("errors.schoolNameRequired"));
			return;
		}

		setState("saving");
		setError(null);
		try {
			const response = await fetch("/api/admin/config/school-settings", {
				method: "PUT",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ schoolName: pendingSchoolName.trim() }),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.saveSchoolNameFailed"));
			}

			const payload = (await response.json()) as ConfigState["schoolSettings"];
			setConfig((prev) =>
				prev
					? {
							...prev,
							schoolSettings: payload,
						}
					: {
							schoolSettings: payload,
							levels: [],
							coursePeriods: [],
							absenceUnits: [],
							subjectCategories: [],
							subjects: [],
						},
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.saveSchoolNameFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const createLevel = async (label: string, order: number) => {
		const normalizedLabel = label.trim();
		if (!normalizedLabel) {
			setError(t("errors.levelLabelRequired"));
			return;
		}
		if (!Number.isFinite(order) || !Number.isInteger(order)) {
			setError(t("errors.orderMustBeInteger"));
			return;
		}

		setState("saving");
		setError(null);
		try {
			const response = await fetch("/api/admin/config/levels", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ label: normalizedLabel, order }),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.createLevelFailed"));
			}

			const payload = (await response.json()) as {
				level: ConfigState["levels"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							levels: sortByOrder([...prev.levels, payload.level]),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : t("errors.createLevelFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const updateLevel = async (
		id: string,
		data: Partial<{ label: string; order: number }>,
	) => {
		const payload: Partial<{ label: string; order: number }> = {};
		if (data.label !== undefined) {
			const trimmed = data.label.trim();
			if (!trimmed) {
				setError(t("errors.levelLabelEmpty"));
				return;
			}
			payload.label = trimmed;
		}
		if (data.order !== undefined) {
			if (!Number.isFinite(data.order) || !Number.isInteger(data.order)) {
				setError(t("errors.orderMustBeInteger"));
				return;
			}
			payload.order = data.order;
		}
		if (Object.keys(payload).length === 0) {
			return;
		}

		setState("saving");
		setError(null);
		try {
			const response = await fetch(`/api/admin/config/levels/${id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.updateLevelFailed"));
			}

			const updated = (await response.json()) as {
				level: ConfigState["levels"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							levels: sortByOrder(
								prev.levels.map((level) =>
									level.id === id ? updated.level : level,
								),
							),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : t("errors.updateLevelFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const deleteLevel = async (id: string) => {
		setState("saving");
		setError(null);
		try {
			const response = await fetch(`/api/admin/config/levels/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.deleteLevelFailed"));
			}

			setConfig((prev) =>
				prev
					? {
							...prev,
							levels: prev.levels.filter((level) => level.id !== id),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : t("errors.deleteLevelFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const coursePeriods = config?.coursePeriods ?? [];
	const [periodForm, setPeriodForm] = useState({
		label: "",
		startsAt: "",
		endsAt: "",
		order: "",
	});

	useEffect(() => {
		setPeriodForm({
			label: "",
			startsAt: "",
			endsAt: "",
			order: String(coursePeriods.length + 1),
		});
	}, [coursePeriods.length]);

	const createPeriod = async () => {
		if (!periodForm.label.trim()) {
			setError(t("errors.periodLabelRequired"));
			return;
		}
		if (!periodForm.startsAt || !periodForm.endsAt) {
			setError(t("errors.timesRequired"));
			return;
		}
		const order = Number.parseInt(periodForm.order, 10);
		if (!Number.isFinite(order) || !Number.isInteger(order)) {
			setError(t("errors.orderMustBeInteger"));
			return;
		}

		const startsAtDate = new Date(periodForm.startsAt);
		const endsAtDate = new Date(periodForm.endsAt);
		if (
			Number.isNaN(startsAtDate.getTime()) ||
			Number.isNaN(endsAtDate.getTime())
		) {
			setError(t("errors.timesMustBeValid"));
			return;
		}
		if (startsAtDate >= endsAtDate) {
			setError(t("errors.endAfterStart"));
			return;
		}

		setState("saving");
		setError(null);
		try {
			const response = await fetch("/api/admin/config/course-periods", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					label: periodForm.label.trim(),
					startsAt: startsAtDate.toISOString(),
					endsAt: endsAtDate.toISOString(),
					order,
				}),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.createPeriodFailed"));
			}

			const payload = (await response.json()) as {
				coursePeriod: ConfigState["coursePeriods"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							coursePeriods: sortByOrder([
								...prev.coursePeriods,
								payload.coursePeriod,
							]),
						}
					: null,
			);
			setPeriodForm({
				label: "",
				startsAt: "",
				endsAt: "",
				order: String(order + 1),
			});
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : t("errors.createPeriodFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const updatePeriod = async (
		id: string,
		updates: Partial<{
			label: string;
			startsAt: string;
			endsAt: string;
			order: number;
		}>,
	) => {
		const payload: Partial<{
			label: string;
			startsAt: string;
			endsAt: string;
			order: number;
		}> = {};
		if (updates.label !== undefined) {
			const trimmed = updates.label.trim();
			if (!trimmed) {
				setError("Period label cannot be empty");
				return;
			}
			payload.label = trimmed;
		}
		if (updates.startsAt !== undefined) {
			const parsed = new Date(updates.startsAt);
			if (Number.isNaN(parsed.getTime())) {
				setError(t("errors.startTimeMustBeValid"));
				return;
			}
			payload.startsAt = parsed.toISOString();
		}
		if (updates.endsAt !== undefined) {
			const parsed = new Date(updates.endsAt);
			if (Number.isNaN(parsed.getTime())) {
				setError(t("errors.endTimeMustBeValid"));
				return;
			}
			payload.endsAt = parsed.toISOString();
		}
		if (payload.startsAt && payload.endsAt) {
			if (new Date(payload.startsAt) >= new Date(payload.endsAt)) {
				setError(t("errors.endAfterStart"));
				return;
			}
		}
		if (updates.order !== undefined) {
			if (!Number.isFinite(updates.order) || !Number.isInteger(updates.order)) {
				setError(t("errors.orderMustBeInteger"));
				return;
			}
			payload.order = updates.order;
		}
		if (Object.keys(payload).length === 0) {
			return;
		}

		setState("saving");
		setError(null);
		try {
			const response = await fetch(`/api/admin/config/course-periods/${id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.updatePeriodFailed"));
			}

			const updated = (await response.json()) as {
				coursePeriod: ConfigState["coursePeriods"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							coursePeriods: sortByOrder(
								prev.coursePeriods.map((period) =>
									period.id === id ? updated.coursePeriod : period,
								),
							),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : t("errors.updatePeriodFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const deletePeriod = async (id: string) => {
		setState("saving");
		setError(null);
		try {
			const response = await fetch(`/api/admin/config/course-periods/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.deletePeriodFailed"));
			}

			setConfig((prev) =>
				prev
					? {
							...prev,
							coursePeriods: prev.coursePeriods.filter(
								(period) => period.id !== id,
							),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : t("errors.deletePeriodFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const absenceUnits = config?.absenceUnits ?? [];
	const createAbsenceUnit = async (label: string, periodIds: string[]) => {
		const normalizedLabel = label.trim();
		if (!normalizedLabel) {
			setError(t("errors.absenceUnitLabelRequired"));
			return;
		}

		const uniquePeriodIds = Array.from(new Set(periodIds));

		setState("saving");
		setError(null);
		try {
			const response = await fetch("/api/admin/config/absence-units", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					label: normalizedLabel,
					periodIds: uniquePeriodIds,
				}),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.createAbsenceUnitFailed"));
			}

			const payload = (await response.json()) as {
				absenceUnit: ConfigState["absenceUnits"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							absenceUnits: [...prev.absenceUnits, payload.absenceUnit],
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.createAbsenceUnitFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const updateAbsenceUnit = async (
		id: string,
		label: string,
		periodIds: string[],
	) => {
		const normalizedLabel = label.trim();
		if (!normalizedLabel) {
			setError(t("errors.absenceUnitLabelEmpty"));
			return;
		}
		const uniquePeriodIds = Array.from(new Set(periodIds));

		setState("saving");
		setError(null);
		try {
			const response = await fetch(`/api/admin/config/absence-units/${id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					label: normalizedLabel,
					periodIds: uniquePeriodIds,
				}),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.updateAbsenceUnitFailed"));
			}

			const payload = (await response.json()) as {
				absenceUnit: ConfigState["absenceUnits"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							absenceUnits: prev.absenceUnits.map((unit) =>
								unit.id === id ? payload.absenceUnit : unit,
							),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.updateAbsenceUnitFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const deleteAbsenceUnit = async (id: string) => {
		setState("saving");
		setError(null);
		try {
			const response = await fetch(`/api/admin/config/absence-units/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.deleteAbsenceUnitFailed"));
			}

			setConfig((prev) =>
				prev
					? {
							...prev,
							absenceUnits: prev.absenceUnits.filter((unit) => unit.id !== id),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.deleteAbsenceUnitFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const createCategory = async (label: string, order: number) => {
		const normalizedLabel = label.trim();
		if (!normalizedLabel) {
			setError(t("errors.categoryLabelRequired"));
			return;
		}
		if (!Number.isFinite(order) || !Number.isInteger(order)) {
			setError(t("errors.orderMustBeInteger"));
			return;
		}

		setState("saving");
		setError(null);
		try {
			const response = await fetch("/api/admin/config/subject-categories", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ label: normalizedLabel, order }),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.createCategoryFailed"));
			}

			const payload = (await response.json()) as {
				subjectCategory: ConfigState["subjectCategories"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							subjectCategories: sortByOrder([
								...prev.subjectCategories,
								payload.subjectCategory,
							]),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.createCategoryFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const updateCategory = async (
		id: string,
		data: Partial<{ label: string; order: number }>,
	) => {
		const payload: Partial<{ label: string; order: number }> = {};
		if (data.label !== undefined) {
			const trimmed = data.label.trim();
			if (!trimmed) {
				setError(t("errors.categoryLabelEmpty"));
				return;
			}
			payload.label = trimmed;
		}
		if (data.order !== undefined) {
			if (!Number.isFinite(data.order) || !Number.isInteger(data.order)) {
				setError(t("errors.orderMustBeInteger"));
				return;
			}
			payload.order = data.order;
		}
		if (Object.keys(payload).length === 0) {
			return;
		}

		setState("saving");
		setError(null);
		try {
			const response = await fetch(
				`/api/admin/config/subject-categories/${id}`,
				{
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.updateCategoryFailed"));
			}

			const updated = (await response.json()) as {
				subjectCategory: ConfigState["subjectCategories"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							subjectCategories: sortByOrder(
								prev.subjectCategories.map((category) =>
									category.id === id ? updated.subjectCategory : category,
								),
							),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.updateCategoryFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const deleteCategory = async (id: string) => {
		setState("saving");
		setError(null);
		try {
			const response = await fetch(
				`/api/admin/config/subject-categories/${id}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.deleteCategoryFailed"));
			}

			setConfig((prev) =>
				prev
					? {
							...prev,
							subjectCategories: prev.subjectCategories.filter(
								(category) => category.id !== id,
							),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.deleteCategoryFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const subjects = config?.subjects ?? [];

	const createSubject = async (payload: {
		label: string;
		weight: number;
		categoryId: string | null;
		valueType: GRADE_VALUE_TYPE;
		numericMin: string | null;
		numericMax: string | null;
		numericDecimals: number | null;
		literalScale: unknown;
	}) => {
		setState("saving");
		setError(null);
		try {
			const response = await fetch("/api/admin/config/subjects", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.createSubjectFailed"));
			}

			const responseBody = (await response.json()) as {
				subject: ConfigState["subjects"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							subjects: [...prev.subjects, responseBody.subject],
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.createSubjectFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const updateSubject = async (
		id: string,
		payload: Partial<{
			label: string;
			weight: number;
			categoryId: string | null;
			valueType: GRADE_VALUE_TYPE;
			numericMin: string | null | undefined;
			numericMax: string | null | undefined;
			numericDecimals: number | null;
			literalScale: unknown;
		}>,
	) => {
		setState("saving");
		setError(null);
		try {
			const response = await fetch(`/api/admin/config/subjects/${id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.updateSubjectFailed"));
			}

			const responseBody = (await response.json()) as {
				subject: ConfigState["subjects"][number];
			};
			setConfig((prev) =>
				prev
					? {
							...prev,
							subjects: prev.subjects.map((subject) =>
								subject.id === id ? responseBody.subject : subject,
							),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.updateSubjectFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const deleteSubject = async (id: string) => {
		setState("saving");
		setError(null);
		try {
			const response = await fetch(`/api/admin/config/subjects/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? t("errors.deleteSubjectFailed"));
			}

			setConfig((prev) =>
				prev
					? {
							...prev,
							subjects: prev.subjects.filter((subject) => subject.id !== id),
						}
					: null,
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: t("errors.deleteSubjectFailed"),
			);
		} finally {
			setState("idle");
		}
	};

	const categories = config?.subjectCategories ?? [];

	const isLoading = state === "loading" && !config;
	const isSaving = state === "saving";

	const levelDefaultOrder = useMemo(
		() => String((config?.levels.length ?? 0) + 1),
		[config?.levels.length],
	);
	const [levelForm, setLevelForm] = useState({ label: "", order: "1" });

	useEffect(() => {
		setLevelForm({ label: "", order: levelDefaultOrder });
	}, [levelDefaultOrder]);

	const [categoryForm, setCategoryForm] = useState({ label: "", order: "1" });

	useEffect(() => {
		setCategoryForm({ label: "", order: String((categories.length ?? 0) + 1) });
	}, [categories.length]);

	if (isLoading) {
		return (
			<p className="p-6 text-sm text-slate-600">{t("loadingConfiguration")}</p>
		);
	}

	return (
		<div className="space-y-10">
			{error && <p className="text-sm text-red-500">{error}</p>}

			<section className="rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
				<h2 className="text-lg font-medium text-slate-900 dark:text-white">
					{t("schoolIdentity")}
				</h2>
				<div className="mt-4 flex flex-wrap items-center gap-4">
					<Input
						value={pendingSchoolName}
						onChange={(event) => setPendingSchoolName(event.target.value)}
						placeholder={t("schoolNamePlaceholder")}
					/>
					<Button onClick={() => void saveSchoolName()} disabled={isSaving}>
						{t("saveName")}
					</Button>
				</div>
			</section>

			<section className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
				<header className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-medium text-slate-900 dark:text-white">
							{t("studyLevels")}
						</h2>
						<p className="text-xs text-slate-500 dark:text-slate-300">
							{t("studyLevelsDescription")}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Input
							value={levelForm.label}
							onChange={(event) =>
								setLevelForm((prev) => ({ ...prev, label: event.target.value }))
							}
							placeholder={t("labelPlaceholder")}
						/>
						<Input
							type="number"
							value={levelForm.order}
							onChange={(event) =>
								setLevelForm((prev) => ({ ...prev, order: event.target.value }))
							}
							placeholder={t("orderPlaceholder")}
						/>
						<Button
							onClick={() =>
								void createLevel(
									levelForm.label.trim(),
									Number.parseInt(levelForm.order, 10),
								)
							}
							disabled={isSaving}
						>
							{t("addLevel")}
						</Button>
					</div>
				</header>

				<div className="space-y-3">
					{config?.levels.map((level) => (
						<EditableLevelRow
							key={level.id}
							level={level}
							onSave={updateLevel}
							onDelete={deleteLevel}
							disabled={isSaving}
						/>
					))}
				</div>
			</section>

			<section className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
				<header className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-medium text-slate-900 dark:text-white">
							{t("coursePeriods")}
						</h2>
						<p className="text-xs text-slate-500 dark:text-slate-300">
							{t("coursePeriodsDescription")}
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Input
							value={periodForm.label}
							onChange={(event) =>
								setPeriodForm((prev) => ({
									...prev,
									label: event.target.value,
								}))
							}
							placeholder={t("labelPlaceholder")}
						/>
						<input
							type="datetime-local"
							value={periodForm.startsAt}
							onChange={(event) =>
								setPeriodForm((prev) => ({
									...prev,
									startsAt: event.target.value,
								}))
							}
							className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
							disabled={isSaving}
						/>
						<input
							type="datetime-local"
							value={periodForm.endsAt}
							onChange={(event) =>
								setPeriodForm((prev) => ({
									...prev,
									endsAt: event.target.value,
								}))
							}
							className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
							disabled={isSaving}
						/>
						<Input
							type="number"
							value={periodForm.order}
							onChange={(event) =>
								setPeriodForm((prev) => ({
									...prev,
									order: event.target.value,
								}))
							}
							placeholder={t("orderPlaceholder")}
						/>
						<Button onClick={() => void createPeriod()} disabled={isSaving}>
							{t("addPeriod")}
						</Button>
					</div>
				</header>

				<div className="space-y-3">
					{coursePeriods.map((period) => (
						<EditablePeriodRow
							key={period.id}
							period={period}
							onSave={updatePeriod}
							onDelete={deletePeriod}
							disabled={isSaving}
						/>
					))}
				</div>
			</section>

			<section className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
				<header>
					<h2 className="text-lg font-medium text-slate-900 dark:text-white">
						{t("absenceUnits")}
					</h2>
					<p className="text-xs text-slate-500 dark:text-slate-300">
						{t("absenceUnitsDescription")}
					</p>
				</header>

				<AbsenceUnitManager
					periods={coursePeriods}
					units={absenceUnits}
					onCreate={createAbsenceUnit}
					onUpdate={updateAbsenceUnit}
					onDelete={deleteAbsenceUnit}
					disabled={isSaving}
				/>
			</section>

			<section className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
				<header className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-medium text-slate-900 dark:text-white">
							{t("subjectCategories")}
						</h2>
						<p className="text-xs text-slate-500 dark:text-slate-300">
							{t("subjectCategoriesDescription")}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Input
							value={categoryForm.label}
							onChange={(event) =>
								setCategoryForm((prev) => ({
									...prev,
									label: event.target.value,
								}))
							}
							placeholder={t("labelPlaceholder")}
						/>
						<Input
							type="number"
							value={categoryForm.order}
							onChange={(event) =>
								setCategoryForm((prev) => ({
									...prev,
									order: event.target.value,
								}))
							}
							placeholder={t("orderPlaceholder")}
						/>
						<Button
							onClick={() =>
								void createCategory(
									categoryForm.label.trim(),
									Number.parseInt(categoryForm.order, 10),
								)
							}
							disabled={isSaving}
						>
							{t("addCategory")}
						</Button>
					</div>
				</header>

				<div className="space-y-3">
					{categories.map((category) => (
						<EditableCategoryRow
							key={category.id}
							category={category}
							onSave={updateCategory}
							onDelete={deleteCategory}
							disabled={isSaving}
						/>
					))}
				</div>
			</section>

			<section className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
				<header>
					<h2 className="text-lg font-medium text-slate-900 dark:text-white">
						{t("subjects")}
					</h2>
					<p className="text-xs text-slate-500 dark:text-slate-300">
						{t("subjectsDescription")}
					</p>
				</header>

				<SubjectManager
					subjects={subjects}
					categories={categories}
					onCreate={createSubject}
					onUpdate={updateSubject}
					onDelete={deleteSubject}
					disabled={isSaving}
				/>
			</section>
		</div>
	);
}

type EditableRowProps = {
	label: string;
	order: string;
	onChangeLabel: (value: string) => void;
	onChangeOrder: (value: string) => void;
	onSave: () => void;
	onDelete: () => void;
	saving: boolean;
};

function EditableRow({
	label,
	order,
	onChangeLabel,
	onChangeOrder,
	onSave,
	onDelete,
	saving,
}: EditableRowProps) {
	const t = useTranslations("app.admin.settings");
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
			<Input
				value={label}
				onChange={(event) => onChangeLabel(event.target.value)}
				placeholder={t("labelPlaceholder")}
				disabled={saving}
			/>
			<Input
				type="number"
				value={order}
				onChange={(event) => onChangeOrder(event.target.value)}
				placeholder={t("orderPlaceholder")}
				disabled={saving}
			/>
			<div className="flex items-center gap-2">
				<Button onClick={onSave} disabled={saving}>
					{t("save")}
				</Button>
				<Button onClick={onDelete} disabled={saving}>
					{t("delete")}
				</Button>
			</div>
		</div>
	);
}

type LevelRowProps = {
	level: { id: string; label: string; order: number };
	onSave: (
		id: string,
		data: Partial<{ label: string; order: number }>,
	) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	disabled: boolean;
};

function EditableLevelRow({
	level,
	onSave,
	onDelete,
	disabled,
}: LevelRowProps) {
	const [label, setLabel] = useState(level.label);
	const [order, setOrder] = useState(String(level.order));

	useEffect(() => {
		setLabel(level.label);
		setOrder(String(level.order));
	}, [level.label, level.order]);

	return (
		<EditableRow
			label={label}
			order={order}
			onChangeLabel={setLabel}
			onChangeOrder={setOrder}
			onSave={() =>
				void onSave(level.id, {
					label: label.trim(),
					order: Number.parseInt(order, 10),
				})
			}
			onDelete={() => void onDelete(level.id)}
			saving={disabled}
		/>
	);
}

type PeriodRowProps = {
	period: ConfigState["coursePeriods"][number];
	onSave: (
		id: string,
		data: Partial<{
			label: string;
			startsAt: string;
			endsAt: string;
			order: number;
		}>,
	) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	disabled: boolean;
};

function EditablePeriodRow({
	period,
	onSave,
	onDelete,
	disabled,
}: PeriodRowProps) {
	const t = useTranslations("app.admin.settings");
	const [form, setForm] = useState({
		label: period.label,
		order: String(period.order),
		startsAt: formatTimeInput(period.startsAt),
		endsAt: formatTimeInput(period.endsAt),
	});

	useEffect(() => {
		setForm({
			label: period.label,
			order: String(period.order),
			startsAt: formatTimeInput(period.startsAt),
			endsAt: formatTimeInput(period.endsAt),
		});
	}, [period.endsAt, period.label, period.order, period.startsAt]);

	return (
		<div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
			<Input
				value={form.label}
				onChange={(event) =>
					setForm((prev) => ({ ...prev, label: event.target.value }))
				}
				placeholder={t("labelPlaceholder")}
				disabled={disabled}
			/>
			<input
				type="datetime-local"
				value={form.startsAt}
				onChange={(event) =>
					setForm((prev) => ({ ...prev, startsAt: event.target.value }))
				}
				className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
				disabled={disabled}
			/>
			<input
				type="datetime-local"
				value={form.endsAt}
				onChange={(event) =>
					setForm((prev) => ({ ...prev, endsAt: event.target.value }))
				}
				className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
				disabled={disabled}
			/>
			<Input
				type="number"
				value={form.order}
				onChange={(event) =>
					setForm((prev) => ({ ...prev, order: event.target.value }))
				}
				placeholder={t("orderPlaceholder")}
				disabled={disabled}
			/>
			<div className="flex items-center gap-2">
				<Button
					onClick={() =>
						void onSave(period.id, {
							label: form.label.trim(),
							startsAt: form.startsAt
								? new Date(form.startsAt).toISOString()
								: undefined,
							endsAt: form.endsAt
								? new Date(form.endsAt).toISOString()
								: undefined,
							order: Number.parseInt(form.order, 10),
						})
					}
					disabled={disabled}
				>
					Save
				</Button>
				<Button onClick={() => void onDelete(period.id)} disabled={disabled}>
					Delete
				</Button>
			</div>
		</div>
	);
}

type AbsenceUnitManagerProps = {
	periods: ConfigState["coursePeriods"];
	units: ConfigState["absenceUnits"];
	onCreate: (label: string, periodIds: string[]) => Promise<void>;
	onUpdate: (id: string, label: string, periodIds: string[]) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	disabled: boolean;
};

function AbsenceUnitManager({
	periods,
	units,
	onCreate,
	onUpdate,
	onDelete,
	disabled,
}: AbsenceUnitManagerProps) {
	const t = useTranslations("app.admin.settings");
	const [label, setLabel] = useState("");
	const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

	const togglePeriod = (periodId: string) => {
		setSelectedPeriods((prev) =>
			prev.includes(periodId)
				? prev.filter((id) => id !== periodId)
				: [...prev, periodId],
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<Input
					value={label}
					onChange={(event) => setLabel(event.target.value)}
					placeholder={t("labelPlaceholder")}
					disabled={disabled}
				/>
				<Button
					onClick={() => {
						if (!label.trim()) {
							return;
						}
						void onCreate(label.trim(), selectedPeriods);
						setLabel("");
						setSelectedPeriods([]);
					}}
					disabled={disabled}
				>
					{t("addAbsenceUnit")}
				</Button>
			</div>

			<div className="flex flex-wrap gap-2">
				{periods.map((period) => {
					const checked = selectedPeriods.includes(period.id);
					return (
						<label
							key={period.id}
							className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:text-white/70"
						>
							<input
								type="checkbox"
								checked={checked}
								onChange={() => togglePeriod(period.id)}
								disabled={disabled}
							/>
							<span>{period.label}</span>
						</label>
					);
				})}
			</div>

			<div className="space-y-3">
				{units.map((unit) => (
					<EditableAbsenceUnitRow
						key={unit.id}
						unit={unit}
						periods={periods}
						onSave={onUpdate}
						onDelete={onDelete}
						disabled={disabled}
					/>
				))}
			</div>
		</div>
	);
}

type EditableAbsenceUnitRowProps = {
	unit: ConfigState["absenceUnits"][number];
	periods: ConfigState["coursePeriods"];
	onSave: (id: string, label: string, periodIds: string[]) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	disabled: boolean;
};

function EditableAbsenceUnitRow({
	unit,
	periods,
	onSave,
	onDelete,
	disabled,
}: EditableAbsenceUnitRowProps) {
	const t = useTranslations("app.admin.settings");
	const [label, setLabel] = useState(unit.label);
	const [selected, setSelected] = useState<string[]>(unit.periodIds);

	useEffect(() => {
		setLabel(unit.label);
		setSelected(unit.periodIds);
	}, [unit.label, unit.periodIds]);

	const toggle = (periodId: string) => {
		setSelected((prev) =>
			prev.includes(periodId)
				? prev.filter((id) => id !== periodId)
				: [...prev, periodId],
		);
	};

	return (
		<div className="space-y-3 rounded-xl border border-slate-200/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
			<div className="flex flex-wrap items-center gap-3">
				<Input
					value={label}
					onChange={(event) => setLabel(event.target.value)}
					placeholder={t("labelPlaceholder")}
					disabled={disabled}
				/>
				<Button
					onClick={() => void onSave(unit.id, label.trim(), selected)}
					disabled={disabled}
				>
					{t("save")}
				</Button>
				<Button onClick={() => void onDelete(unit.id)} disabled={disabled}>
					{t("delete")}
				</Button>
			</div>
			<div className="flex flex-wrap gap-2">
				{periods.map((period) => {
					const checked = selected.includes(period.id);
					return (
						<label
							key={period.id}
							className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:text-white/70"
						>
							<input
								type="checkbox"
								checked={checked}
								onChange={() => toggle(period.id)}
								disabled={disabled}
							/>
							<span>{period.label}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
}

type CategoryRowProps = {
	category: ConfigState["subjectCategories"][number];
	onSave: (
		id: string,
		data: Partial<{ label: string; order: number }>,
	) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	disabled: boolean;
};

function EditableCategoryRow({
	category,
	onSave,
	onDelete,
	disabled,
}: CategoryRowProps) {
	const [label, setLabel] = useState(category.label);
	const [order, setOrder] = useState(String(category.order));

	useEffect(() => {
		setLabel(category.label);
		setOrder(String(category.order));
	}, [category.label, category.order]);

	return (
		<EditableRow
			label={label}
			order={order}
			onChangeLabel={setLabel}
			onChangeOrder={setOrder}
			onSave={() =>
				void onSave(category.id, {
					label: label.trim(),
					order: Number.parseInt(order, 10),
				})
			}
			onDelete={() => void onDelete(category.id)}
			saving={disabled}
		/>
	);
}

type SubjectManagerProps = {
	subjects: ConfigState["subjects"];
	categories: ConfigState["subjectCategories"];
	onCreate: (payload: {
		label: string;
		weight: number;
		categoryId: string | null;
		valueType: GRADE_VALUE_TYPE;
		numericMin: string | null;
		numericMax: string | null;
		numericDecimals: number | null;
		literalScale: unknown;
	}) => Promise<void>;
	onUpdate: (
		id: string,
		payload: Partial<{
			label: string;
			weight: number;
			categoryId: string | null;
			valueType: GRADE_VALUE_TYPE;
			numericMin: string | null | undefined;
			numericMax: string | null | undefined;
			numericDecimals: number | null;
			literalScale: unknown;
		}>,
	) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	disabled: boolean;
};

function SubjectManager({
	subjects,
	categories,
	onCreate,
	onUpdate,
	onDelete,
	disabled,
}: SubjectManagerProps) {
	const t = useTranslations("app.admin.settings");
	const [form, setForm] = useState({
		label: "",
		weight: "0",
		categoryId: "",
		valueType: "NUMERIC" as GRADE_VALUE_TYPE,
		numericMin: "0",
		numericMax: "10",
		numericDecimals: "0",
		literalScaleRaw: "",
	});

	const resetForm = () => {
		setForm({
			label: "",
			weight: "0",
			categoryId: "",
			valueType: "NUMERIC" as GRADE_VALUE_TYPE,
			numericMin: "0",
			numericMax: "10",
			numericDecimals: "0",
			literalScaleRaw: "",
		});
	};

	const submit = async () => {
		if (!form.label.trim()) {
			return;
		}

		const payload = {
			label: form.label.trim(),
			weight: Number.parseInt(form.weight, 10) || 0,
			categoryId: form.categoryId ? form.categoryId : null,
			valueType: form.valueType as GRADE_VALUE_TYPE,
			numericMin: null as string | null,
			numericMax: null as string | null,
			numericDecimals: null as number | null,
			literalScale: null as unknown,
		};

		if (payload.valueType === "NUMERIC") {
			payload.numericMin = form.numericMin
				? String(Number(form.numericMin))
				: null;
			payload.numericMax = form.numericMax
				? String(Number(form.numericMax))
				: null;
			const parsedDecimals = Number.parseInt(form.numericDecimals, 10);
			payload.numericDecimals = Number.isNaN(parsedDecimals)
				? 0
				: parsedDecimals;
		} else {
			try {
				payload.literalScale = JSON.parse(form.literalScaleRaw || "[]");
			} catch {
				window.alert("Literal scale must be valid JSON");
				return;
			}
		}

		await onCreate(payload);
		resetForm();
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
				<Input
					value={form.label}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, label: event.target.value }))
					}
					placeholder={t("labelPlaceholder")}
					disabled={disabled}
				/>
				<Input
					type="number"
					value={form.weight}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, weight: event.target.value }))
					}
					placeholder={t("weightPlaceholder")}
					disabled={disabled}
				/>
				<select
					value={form.categoryId}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, categoryId: event.target.value }))
					}
					className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
					disabled={disabled}
				>
					<option value="">{t("noCategory")}</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.label}
						</option>
					))}
				</select>
				<select
					value={form.valueType}
					onChange={(event) =>
						setForm((prev) => ({
							...prev,
							valueType: event.target.value as GRADE_VALUE_TYPE,
						}))
					}
					className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
					disabled={disabled}
				>
					<option value="NUMERIC">{t("valueTypes.numeric")}</option>
					<option value="LITERAL">{t("valueTypes.literal")}</option>
				</select>
				{form.valueType === "NUMERIC" ? (
					<>
						<Input
							value={form.numericMin}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, numericMin: event.target.value }))
							}
							placeholder={t("numericMinLabel")}
							disabled={disabled}
						/>
						<Input
							value={form.numericMax}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, numericMax: event.target.value }))
							}
							placeholder={t("numericMaxLabel")}
							disabled={disabled}
						/>
						<Input
							value={form.numericDecimals}
							onChange={(event) =>
								setForm((prev) => ({
									...prev,
									numericDecimals: event.target.value,
								}))
							}
							placeholder={t("numericDecimalsLabel")}
							disabled={disabled}
						/>
					</>
				) : (
					<textarea
						value={form.literalScaleRaw}
						onChange={(event) =>
							setForm((prev) => ({
								...prev,
								literalScaleRaw: event.target.value,
							}))
						}
						rows={3}
						placeholder={t("literalScalePlaceholder")}
						className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
						disabled={disabled}
					/>
				)}
				<Button onClick={() => void submit()} disabled={disabled}>
					{t("addSubject")}
				</Button>
			</div>

			<div className="space-y-3">
				{subjects.map((subject) => (
					<EditableSubjectRow
						key={subject.id}
						subject={subject}
						categories={categories}
						onSave={onUpdate}
						onDelete={onDelete}
						disabled={disabled}
					/>
				))}
			</div>
		</div>
	);
}

type EditableSubjectRowProps = {
	subject: ConfigState["subjects"][number];
	categories: ConfigState["subjectCategories"];
	onSave: SubjectManagerProps["onUpdate"];
	onDelete: (id: string) => Promise<void>;
	disabled: boolean;
};

function EditableSubjectRow({
	subject,
	categories,
	onSave,
	onDelete,
	disabled,
}: EditableSubjectRowProps) {
	const t = useTranslations("app.admin.settings");
	const [form, setForm] = useState({
		label: subject.label,
		weight: String(subject.weight),
		categoryId: subject.categoryId ?? "",
		valueType: subject.valueType,
		numericMin: subject.numericMin ?? "",
		numericMax: subject.numericMax ?? "",
		numericDecimals:
			subject.numericDecimals != null ? String(subject.numericDecimals) : "",
		literalScaleRaw: (() => {
			try {
				return JSON.stringify(subject.literalScale ?? []);
			} catch {
				return "[]";
			}
		})(),
	});

	useEffect(() => {
		setForm({
			label: subject.label,
			weight: String(subject.weight),
			categoryId: subject.categoryId ?? "",
			valueType: subject.valueType,
			numericMin: subject.numericMin ?? "",
			numericMax: subject.numericMax ?? "",
			numericDecimals:
				subject.numericDecimals != null ? String(subject.numericDecimals) : "",
			literalScaleRaw: (() => {
				try {
					return JSON.stringify(subject.literalScale ?? []);
				} catch {
					return "[]";
				}
			})(),
		});
	}, [
		subject.categoryId,
		subject.label,
		subject.literalScale,
		subject.numericMax,
		subject.numericMin,
		subject.numericDecimals,
		subject.valueType,
		subject.weight,
	]);

	const save = async () => {
		const payload: Parameters<SubjectManagerProps["onUpdate"]>[1] = {
			label: form.label.trim(),
			weight: Number.parseInt(form.weight, 10) || 0,
			categoryId: form.categoryId ? form.categoryId : null,
			valueType: form.valueType,
		};

		if (form.valueType === "NUMERIC") {
			payload.numericMin = form.numericMin
				? String(Number(form.numericMin))
				: null;
			payload.numericMax = form.numericMax
				? String(Number(form.numericMax))
				: null;
			payload.numericDecimals = (() => {
				if (!form.numericDecimals) {
					return null;
				}
				const parsed = Number.parseInt(form.numericDecimals, 10);
				return Number.isNaN(parsed) ? null : parsed;
			})();
		} else {
			try {
				payload.literalScale = JSON.parse(form.literalScaleRaw || "[]");
			} catch {
				window.alert(t("errors.literalScaleInvalid"));
				return;
			}
		}

		await onSave(subject.id, payload);
	};

	return (
		<div className="space-y-3 rounded-xl border border-slate-200/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
			<div className="flex flex-wrap items-center gap-3">
				<Input
					value={form.label}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, label: event.target.value }))
					}
					placeholder={t("labelPlaceholder")}
					disabled={disabled}
				/>
				<Input
					type="number"
					value={form.weight}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, weight: event.target.value }))
					}
					placeholder={t("weightPlaceholder")}
					disabled={disabled}
				/>
				<select
					value={form.categoryId}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, categoryId: event.target.value }))
					}
					className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
					disabled={disabled}
				>
					<option value="">{t("noCategory")}</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.label}
						</option>
					))}
				</select>
				<select
					value={form.valueType}
					onChange={(event) =>
						setForm((prev) => ({
							...prev,
							valueType: event.target.value as GRADE_VALUE_TYPE,
						}))
					}
					className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
					disabled={disabled}
				>
					<option value="NUMERIC">{t("valueTypes.numeric")}</option>
					<option value="LITERAL">{t("valueTypes.literal")}</option>
				</select>
			</div>
			{form.valueType === "NUMERIC" ? (
				<div className="flex flex-wrap items-center gap-3">
					<Input
						value={form.numericMin}
						onChange={(event) =>
							setForm((prev) => ({ ...prev, numericMin: event.target.value }))
						}
						placeholder={t("numericMinLabel")}
						disabled={disabled}
					/>
					<Input
						value={form.numericMax}
						onChange={(event) =>
							setForm((prev) => ({ ...prev, numericMax: event.target.value }))
						}
						placeholder={t("numericMaxLabel")}
						disabled={disabled}
					/>
					<Input
						value={form.numericDecimals}
						onChange={(event) =>
							setForm((prev) => ({
								...prev,
								numericDecimals: event.target.value,
							}))
						}
						placeholder={t("numericDecimalsLabel")}
						disabled={disabled}
					/>
				</div>
			) : (
				<textarea
					value={form.literalScaleRaw}
					onChange={(event) =>
						setForm((prev) => ({
							...prev,
							literalScaleRaw: event.target.value,
						}))
					}
					rows={3}
					className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/8"
					disabled={disabled}
				/>
			)}
			<div className="flex items-center gap-2">
				<Button onClick={() => void save()} disabled={disabled}>
					{t("save")}
				</Button>
				<Button onClick={() => void onDelete(subject.id)} disabled={disabled}>
					{t("delete")}
				</Button>
			</div>
		</div>
	);
}
