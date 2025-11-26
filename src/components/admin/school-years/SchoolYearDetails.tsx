import { useFormatter, useNow, useTranslations } from "next-intl";
import type { FC } from "react";
import type { Variant as StatusBadgeVariant } from "#components/Common/StatusBadge.tsx";
import { StatusBadge } from "#components/Common/StatusBadge.tsx";
import type {
	AdminEvaluationPeriod,
	AdminSchoolYear,
	SchoolYearStatus,
} from "#types/admin/schoolYear.ts";
import { EvaluationPeriodsSection } from "./EvaluationPeriodsSection.tsx";
import { SummaryMetric } from "./SummaryMetric.tsx";

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

type SchoolYearDetailsProps = {
	year: SchoolYear;
	onAddEvaluationPeriod: (
		yearId: string,
		period: Omit<EvaluationPeriod, "id" | "status">,
	) => Promise<void>;
	onRemoveEvaluationPeriod: (yearId: string, periodId: string) => Promise<void>;
};

export const SchoolYearDetails: FC<SchoolYearDetailsProps> = ({
	year,
	onAddEvaluationPeriod,
	onRemoveEvaluationPeriod,
}) => {
	const t = useTranslations("app.admin.schoolYears");
	const now = useNow();
	const format = useFormatter();

	return (
		<div className="space-y-6">
			<section className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
				<header className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
							{year.label}
						</h2>
						<p className="text-sm text-slate-600 dark:text-slate-300">
							{format.dateTimeRange(
								new Date(year.startsAt),
								new Date(year.endsAt),
								{
									dateStyle: "medium",
								},
							)}
						</p>
						<p className="text-xs text-slate-500 dark:text-slate-300">
							{t("overview.updated", {
								value: format.relativeTime(new Date(year.updatedAt), now),
							})}
						</p>
					</div>
					<StatusBadge variant={STATUS_BADGE_VARIANT[year.status]}>
						{t(`statuses.${year.status}`)}
					</StatusBadge>
				</header>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<SummaryMetric
						title={t("summary.students")}
						value={String(year.studentsCount)}
					/>
					<SummaryMetric
						title={t("summary.classes")}
						value={String(year.classesCount)}
					/>
					<SummaryMetric
						title={t("summary.groups")}
						value={String(year.groupsCount)}
					/>
					<SummaryMetric
						title={t("summary.periods")}
						value={String(year.evaluationPeriods.length)}
					/>
				</div>
				{year.levels.length ? (
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							{t("overview.levels")}
						</p>
						<div className="flex flex-wrap gap-2">
							{year.levels.map((level) => (
								<span
									key={level}
									className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300"
								>
									{level}
								</span>
							))}
						</div>
					</div>
				) : null}

				{year.absenceUnits.length ? (
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							{t("overview.absenceUnits")}
						</p>
						<div className="flex flex-wrap gap-2">
							{year.absenceUnits.map((unit) => (
								<span
									key={unit}
									className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300"
								>
									{unit}
								</span>
							))}
						</div>
					</div>
				) : null}

				{year.notes ? (
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							{t("overview.notes")}
						</p>
						<p className="text-sm text-slate-600 dark:text-slate-300">
							{year.notes}
						</p>
					</div>
				) : null}
			</section>

			<EvaluationPeriodsSection
				year={year}
				onAdd={onAddEvaluationPeriod}
				onRemove={onRemoveEvaluationPeriod}
			/>
		</div>
	);
};
