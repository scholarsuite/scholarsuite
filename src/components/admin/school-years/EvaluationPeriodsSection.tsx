"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import { useFormatter, useTranslations } from "next-intl";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { Button } from "#components/Common/Button.tsx";
import { InfoBox } from "#components/Common/InfoBox.tsx";
import { Input } from "#components/Common/Input.tsx";
import { StatusBadge } from "#components/Common/StatusBadge.tsx";
import { Table, Tbody, Td, Th, Thead, Tr } from "#components/Common/Table.tsx";
import type {
	AdminEvaluationPeriod,
	AdminSchoolYear,
	EvaluationPeriodStatus,
} from "#types/admin/schoolYear.ts";

type EvaluationPeriod = AdminEvaluationPeriod;
type SchoolYear = AdminSchoolYear;

type StatusBadgeVariant = "success" | "warning" | "info" | "danger" | "neutral";

const PERIOD_BADGE_VARIANT: Record<EvaluationPeriodStatus, StatusBadgeVariant> =
	{
		planned: "info",
		open: "success",
		locked: "warning",
		archived: "neutral",
	};

type EvaluationPeriodsSectionProps = {
	year: SchoolYear;
	onAdd: (
		yearId: string,
		period: Omit<EvaluationPeriod, "id" | "status">,
	) => Promise<void>;
	onRemove: (yearId: string, periodId: string) => Promise<void>;
};

export const EvaluationPeriodsSection: FC<EvaluationPeriodsSectionProps> = ({
	year,
	onAdd,
	onRemove,
}) => {
	const t = useTranslations("app.admin.schoolYears");
	const format = useFormatter();
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [form, setForm] = useState({
		label: "",
		startsAt: "",
		endsAt: "",
		order: String(year.evaluationPeriods.length + 1),
	});

	useEffect(() => {
		setForm({
			label: "",
			startsAt: "",
			endsAt: "",
			order: String(year.evaluationPeriods.length + 1),
		});
	}, [year]);

	const submit = async () => {
		const trimmedLabel = form.label.trim();
		if (!trimmedLabel) {
			setError(t("evaluationPeriods.errors.labelRequired"));
			return;
		}
		if (!form.startsAt || !form.endsAt) {
			setError(t("evaluationPeriods.errors.datesRequired"));
			return;
		}
		const startDate = new Date(form.startsAt);
		const endDate = new Date(form.endsAt);
		if (
			Number.isNaN(startDate.getTime()) ||
			Number.isNaN(endDate.getTime()) ||
			startDate > endDate
		) {
			setError(t("evaluationPeriods.errors.invalidDateRange"));
			return;
		}
		const order = Number.parseInt(form.order, 10);
		if (!Number.isFinite(order) || order <= 0) {
			setError(t("evaluationPeriods.errors.invalidOrder"));
			return;
		}

		setSubmitting(true);
		try {
			await onAdd(year.id, {
				label: trimmedLabel,
				startsAt: startDate.toISOString(),
				endsAt: endDate.toISOString(),
				order,
			});
			setError(null);
			setForm({
				label: "",
				startsAt: "",
				endsAt: "",
				order: String(order + 1),
			});
		} catch {
			// Parent component surfaces API errors through the shared alert box.
		} finally {
			setSubmitting(false);
		}
	};

	const removePeriod = async (periodId: string) => {
		setRemovingId(periodId);
		try {
			await onRemove(year.id, periodId);
		} catch {
			// Parent component surfaces API errors through the shared alert box.
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<section className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
						{t("evaluationPeriods.title")}
					</h3>
					<p className="text-xs text-slate-500 dark:text-slate-300">
						{t("evaluationPeriods.description", {
							year: year.label,
						})}
					</p>
				</div>
				<Button
					type="button"
					onClick={() => void submit()}
					className="mt-0"
					disabled={submitting}
				>
					{t("evaluationPeriods.add")}
				</Button>
			</div>

			{error && <InfoBox variant="error">{error}</InfoBox>}

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Input
					value={form.label}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, label: event.target.value }))
					}
					placeholder={t("evaluationPeriods.labelPlaceholder")}
				/>
				<Input
					type="date"
					value={form.startsAt}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, startsAt: event.target.value }))
					}
					placeholder={t("evaluationPeriods.startDate")}
				/>
				<Input
					type="date"
					value={form.endsAt}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, endsAt: event.target.value }))
					}
					placeholder={t("evaluationPeriods.endDate")}
				/>
				<Input
					type="number"
					value={form.order}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, order: event.target.value }))
					}
					placeholder={t("evaluationPeriods.order")}
				/>
			</div>

			<div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10">
				{year.evaluationPeriods.length === 0 ? (
					<p className="p-6 text-sm text-slate-500 dark:text-slate-300">
						{t("evaluationPeriods.empty")}
					</p>
				) : (
					<Table>
						<Thead>
							<Tr>
								<Th>{t("evaluationPeriods.table.name")}</Th>
								<Th>{t("evaluationPeriods.table.dates")}</Th>
								<Th>{t("evaluationPeriods.table.order")}</Th>
								<Th>{t("evaluationPeriods.table.status")}</Th>
								<Th className="text-right">
									{t("evaluationPeriods.table.actions")}
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{year.evaluationPeriods.map((period) => (
								<Tr key={period.id}>
									<Td>
										<div className="space-y-1">
											<p className="text-sm font-medium text-slate-900 dark:text-white">
												{period.label}
											</p>
											<p className="text-xs text-slate-500 dark:text-slate-300">
												{format.dateTimeRange(
													new Date(period.startsAt),
													new Date(period.endsAt),
													{ dateStyle: "medium" },
												)}
											</p>
										</div>
									</Td>
									<Td className="align-middle text-sm text-slate-600 dark:text-slate-300">
										{format.dateTime(new Date(period.startsAt), {
											dateStyle: "medium",
										})}
										<span className="mx-1">→</span>
										{format.dateTime(new Date(period.endsAt), {
											dateStyle: "medium",
										})}
									</Td>
									<Td className="align-middle text-sm text-slate-600 dark:text-slate-300">
										{period.order}
									</Td>
									<Td>
										<StatusBadge variant={PERIOD_BADGE_VARIANT[period.status]}>
											{t(`evaluationPeriods.status.${period.status}`)}
										</StatusBadge>
									</Td>
									<Td className="text-right">
										<Button
											type="button"
											onClick={() => void removePeriod(period.id)}
											disabled={removingId === period.id || submitting}
											size="small"
											variant="danger"
										>
											<TrashIcon className="mr-1 inline size-4 align-middle" />
											{t("evaluationPeriods.remove")}
										</Button>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				)}
			</div>
		</section>
	);
};
