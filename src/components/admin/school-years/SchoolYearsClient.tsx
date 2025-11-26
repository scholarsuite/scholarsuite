"use client";

import classNames from "classnames";
import { useFormatter, useTranslations } from "next-intl";
import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InfoBox } from "#components/Common/InfoBox.tsx";
import type { Variant as StatusBadgeVariant } from "#components/Common/StatusBadge.tsx";
import { StatusBadge } from "#components/Common/StatusBadge.tsx";
import type {
	AdminEvaluationPeriod,
	AdminSchoolYear,
	SchoolYearStatus,
} from "#types/admin/schoolYear.ts";
import { CreateSchoolYearForm } from "./CreateSchoolYearForm.tsx";
import { SchoolYearDetails } from "./SchoolYearDetails.tsx";

export const STATUS_BADGE_VARIANT: Record<
	SchoolYearStatus,
	StatusBadgeVariant
> = {
	active: "success",
	upcoming: "info",
	archived: "neutral",
};

type EvaluationPeriod = AdminEvaluationPeriod;
type SchoolYear = AdminSchoolYear;

type SchoolYearFilter = "all" | SchoolYearStatus;

export const SchoolYearsClient: FC = () => {
	const t = useTranslations("app.admin.schoolYears");
	const format = useFormatter();

	const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
	const [filter, setFilter] = useState<SchoolYearFilter>("active");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [creating, setCreating] = useState(false);

	const assignError = useCallback(
		(cause: unknown) => {
			const fallback = t("messages.genericError");
			const message =
				cause instanceof Error && cause.message.trim().length > 0
					? cause.message
					: typeof cause === "string" && cause.trim().length > 0
						? cause
						: fallback;
			setError(message);
			return message;
		},
		[t],
	);

	const loadSchoolYears = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/admin/school-years", {
				credentials: "include",
				cache: "no-store",
			});
			let data: unknown;
			try {
				data = await response.json();
			} catch {
				data = null;
			}

			if (!response.ok) {
				const fallback = t("messages.loadFailed", { status: response.status });
				const parsed = (data ?? {}) as { error?: unknown };
				const message =
					typeof parsed.error === "string" && parsed.error.trim().length > 0
						? parsed.error
						: fallback;
				throw new Error(message);
			}

			const parsed = (data ?? {}) as { schoolYears?: SchoolYear[] };
			const normalized = Array.isArray(parsed.schoolYears)
				? sortSchoolYears(parsed.schoolYears)
				: [];

			setSchoolYears(normalized);
			setSelectedId((previous) => {
				if (normalized.length === 0) {
					return null;
				}
				if (previous && normalized.some((year) => year.id === previous)) {
					return previous;
				}
				return normalized[0].id;
			});
		} catch (cause) {
			assignError(cause);
			setSchoolYears([]);
			setSelectedId(null);
		} finally {
			setLoading(false);
		}
	}, [assignError, t]);

	useEffect(() => {
		void loadSchoolYears();
	}, [loadSchoolYears]);

	const filteredSchoolYears = useMemo(() => {
		if (filter === "all") {
			return schoolYears;
		}
		return schoolYears.filter((year) => year.status === filter);
	}, [filter, schoolYears]);

	const hasActiveYear = useMemo(
		() => schoolYears.some((year) => year.status === "active"),
		[schoolYears],
	);
	const showNoActiveYearMessage =
		!loading && filter === "active" && !hasActiveYear;

	const selectedYear = useMemo(
		() => schoolYears.find((year) => year.id === selectedId) ?? null,
		[schoolYears, selectedId],
	);

	const selectYear = (yearId: string) => {
		setSelectedId(yearId);
		setIsCreating(false);
	};

	const openCreation = () => {
		setIsCreating(true);
		setSelectedId(null);
	};

	const closeCreation = () => {
		setIsCreating(false);
		if (!selectedId && schoolYears.length > 0) {
			setSelectedId(schoolYears[0].id);
		}
	};

	const handleCreateYear = useCallback(
		async (payload: {
			label: string;
			startsAt: string;
			endsAt: string;
			levels: string[];
		}) => {
			setCreating(true);
			setError(null);
			try {
				const response = await fetch("/api/admin/school-years", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(payload),
				});
				let data: unknown;
				try {
					data = await response.json();
				} catch {
					data = null;
				}

				if (!response.ok) {
					const fallback = t("messages.genericError");
					const parsed = (data ?? {}) as { error?: unknown };
					const message =
						typeof parsed.error === "string" && parsed.error.trim().length > 0
							? parsed.error
							: fallback;
					throw new Error(message);
				}

				const parsed = (data ?? {}) as { schoolYear?: SchoolYear };
				const created = parsed.schoolYear;
				if (!created) {
					throw new Error(t("messages.genericError"));
				}

				setSchoolYears((prev) =>
					sortSchoolYears([
						...prev.filter((year) => year.id !== created.id),
						created,
					]),
				);
				setSelectedId(created.id);
				setIsCreating(false);
			} catch (cause) {
				const message = assignError(cause);
				throw new Error(message);
			} finally {
				setCreating(false);
			}
		},
		[assignError, t],
	);

	const handleAddEvaluationPeriod = useCallback(
		async (yearId: string, period: Omit<EvaluationPeriod, "id" | "status">) => {
			setError(null);
			try {
				const response = await fetch(
					`/api/admin/school-years/${yearId}/evaluation-periods`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify(period),
					},
				);
				let data: unknown;
				try {
					data = await response.json();
				} catch {
					data = null;
				}

				if (!response.ok) {
					const fallback = t("messages.genericError");
					const parsed = (data ?? {}) as { error?: unknown };
					const message =
						typeof parsed.error === "string" && parsed.error.trim().length > 0
							? parsed.error
							: fallback;
					throw new Error(message);
				}

				const parsed = (data ?? {}) as { schoolYear?: SchoolYear };
				const updated = parsed.schoolYear;
				if (!updated) {
					throw new Error(t("messages.genericError"));
				}

				setSchoolYears((prev) =>
					sortSchoolYears(
						prev.map((year) => (year.id === updated.id ? updated : year)),
					),
				);
				setSelectedId(updated.id);
			} catch (cause) {
				const message = assignError(cause);
				throw new Error(message);
			}
		},
		[assignError, t],
	);

	const handleRemoveEvaluationPeriod = useCallback(
		async (yearId: string, periodId: string) => {
			setError(null);
			try {
				const response = await fetch(
					`/api/admin/school-years/${yearId}/evaluation-periods/${periodId}`,
					{
						method: "DELETE",
						credentials: "include",
					},
				);
				let data: unknown;
				try {
					data = await response.json();
				} catch {
					data = null;
				}

				if (!response.ok) {
					const fallback = t("messages.genericError");
					const parsed = (data ?? {}) as { error?: unknown };
					const message =
						typeof parsed.error === "string" && parsed.error.trim().length > 0
							? parsed.error
							: fallback;
					throw new Error(message);
				}

				const parsed = (data ?? {}) as { schoolYear?: SchoolYear };
				const updated = parsed.schoolYear;
				if (!updated) {
					throw new Error(t("messages.genericError"));
				}

				setSchoolYears((prev) =>
					sortSchoolYears(
						prev.map((year) => (year.id === updated.id ? updated : year)),
					),
				);
				setSelectedId(updated.id);
			} catch (cause) {
				const message = assignError(cause);
				throw new Error(message);
			}
		},
		[assignError, t],
	);

	const filters: Array<{ id: SchoolYearFilter; label: string }> = [
		{ id: "active", label: t("list.filters.active") },
		{ id: "upcoming", label: t("list.filters.upcoming") },
		{ id: "archived", label: t("list.filters.archived") },
		{ id: "all", label: t("list.filters.all") },
	];

	return (
		<div className="space-y-6">
			{error && <InfoBox variant="error">{error}</InfoBox>}

			<div className="grid gap-6 lg:grid-cols-[320px,1fr]">
				<aside className="space-y-4">
					<section className="rounded-2xl border border-slate-200/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/4">
						<div className="flex items-center justify-between gap-3">
							<h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
								{t("list.title")}
							</h2>
							<button
								type="button"
								onClick={openCreation}
								className="text-xs font-semibold uppercase tracking-wide text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
							>
								{t("list.create")}
							</button>
						</div>
						<div className="mt-4 flex flex-wrap gap-2">
							{filters.map((item) => {
								const isActive = item.id === filter;

								return (
									<button
										key={item.id}
										type="button"
										onClick={() => setFilter(item.id)}
										className={classNames(
											"rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400",
											{
												"border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-300/60 dark:bg-indigo-500/10 dark:text-indigo-200":
													isActive,
												"border-slate-200 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-slate-300":
													!isActive,
											},
										)}
									>
										{item.label}
									</button>
								);
							})}
						</div>
					</section>

					<section className="space-y-3">
						{loading ? (
							<p className="rounded-2xl border border-slate-200/80 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
								{t("messages.loading")}
							</p>
						) : showNoActiveYearMessage ? (
							<p className="rounded-2xl border border-slate-200/80 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
								{t("messages.noActiveYear")}
							</p>
						) : filteredSchoolYears.length === 0 ? (
							<p className="rounded-2xl border border-slate-200/80 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
								{t("list.empty")}
							</p>
						) : (
							filteredSchoolYears.map((year) => (
								<button
									key={year.id}
									type="button"
									onClick={() => selectYear(year.id)}
									className={`w-full rounded-2xl border p-4 text-left transition hover:border-indigo-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:hover:border-indigo-400/60 dark:focus:ring-indigo-400 ${selectedId === year.id ? "border-indigo-400 bg-indigo-50/80 dark:border-indigo-400/60 dark:bg-indigo-500/10" : "border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/4"}`}
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-semibold text-slate-900 dark:text-white">
												{year.label}
											</p>
											<p className="text-xs text-slate-500 dark:text-slate-300">
												{format.dateTimeRange(
													new Date(year.startsAt),
													new Date(year.endsAt),
													{ dateStyle: "medium" },
												)}
											</p>
										</div>
										<StatusBadge variant={STATUS_BADGE_VARIANT[year.status]}>
											{t(`statuses.${year.status}`)}
										</StatusBadge>
									</div>
								</button>
							))
						)}
					</section>
				</aside>

				<main className="space-y-6">
					{isCreating ? (
						<CreateSchoolYearForm
							onCancel={closeCreation}
							onSubmit={handleCreateYear}
							isSubmitting={creating}
						/>
					) : selectedYear ? (
						<SchoolYearDetails
							year={selectedYear}
							onAddEvaluationPeriod={handleAddEvaluationPeriod}
							onRemoveEvaluationPeriod={handleRemoveEvaluationPeriod}
						/>
					) : (
						<div className="rounded-2xl border border-slate-200/80 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/4 dark:text-slate-300">
							{t("messages.noSelection")}
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

function sortSchoolYears(years: SchoolYear[]) {
	return [...years].sort((a, b) => {
		if (a.status === b.status) {
			return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
		}
		const priority: Record<SchoolYearStatus, number> = {
			active: 0,
			upcoming: 1,
			archived: 2,
		};
		return priority[a.status] - priority[b.status];
	});
}
