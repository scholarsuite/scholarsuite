"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useFormatter, useNow, useTranslations } from "next-intl";
import type { FC } from "react";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { LevelBadge } from "#components/admin/logs/LevelBadge.tsx";
import { Button } from "#components/Common/Button.tsx";
import { InfoBox } from "#components/Common/InfoBox.tsx";
import { Input } from "#components/Common/Input.tsx";
import { Label } from "#components/Common/Label.tsx";
import { MetadataViewer } from "#components/Common/MetadataViewer.tsx";
import { Select } from "#components/Common/Select.tsx";
import { Tag } from "#components/Common/Tag.tsx";
import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";
import { LOG_LEVEL } from "#prisma/enums";
import type {
	AdminLogEntry,
	AdminLogsAggregates,
	AdminLogsMeta,
	AdminLogsResponse,
} from "#types/admin/logs.ts";
import { ADMIN_LOGS_PAGE_SIZE_DEFAULT } from "#types/admin/logs.ts";

const LEVEL_ORDER: readonly LOG_LEVEL[] = [
	LOG_LEVEL.ERROR,
	LOG_LEVEL.WARN,
	LOG_LEVEL.INFO,
	LOG_LEVEL.DEBUG,
];

const PAGE_SIZE = ADMIN_LOGS_PAGE_SIZE_DEFAULT;

type LevelFilter = LOG_LEVEL | "";

const ALL_LEVEL_SELECT_VALUE = "__all__";
type LevelSelectValue = LOG_LEVEL | typeof ALL_LEVEL_SELECT_VALUE;

type FiltersState = {
	level: LevelFilter;
	startDate: string;
	endDate: string;
};

const AdminLogsPage: FC = () => {
	const t = useTranslations("app.admin.logs");
	const tAdmin = useTranslations("app.admin");
	const now = useNow();
	const format = useFormatter();

	const [logs, setLogs] = useState<AdminLogEntry[]>([]);
	const [meta, setMeta] = useState<AdminLogsMeta | null>(null);
	const [aggregates, setAggregates] = useState<AdminLogsAggregates | null>(
		null,
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [page, setPage] = useState<number>(1);
	const [filters, setFilters] = useState<FiltersState>({
		level: "",
		startDate: "",
		endDate: "",
	});
	const [pendingFilters, setPendingFilters] = useState<FiltersState>({
		level: "",
		startDate: "",
		endDate: "",
	});

	const startDateInputId = useId();
	const endDateInputId = useId();

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const fetchLogs = useCallback(async () => {
		setLoading(true);
		setError(null);

		const params = new URLSearchParams({
			page: String(page),
			pageSize: String(PAGE_SIZE),
		});

		if (filters.level) {
			params.set("level", filters.level);
		}

		if (filters.startDate) {
			params.set("start", filters.startDate);
		}

		if (filters.endDate) {
			params.set("end", filters.endDate);
		}

		try {
			const response = await fetch(`/api/admin/logs?${params.toString()}`, {
				cache: "no-store",
			});

			if (!response.ok) {
				let message = t("messages.loadFailed", { status: response.status });

				try {
					const body = (await response.json()) as { error?: string };
					if (body?.error) {
						message = body.error;
					}
				} catch {
					// ignore parsing failures and use default message
				}

				setLogs([]);
				setMeta(null);
				setAggregates(null);
				setError(message);
				return;
			}

			const payload = (await response.json()) as AdminLogsResponse;
			setLogs(payload.data);
			setMeta(payload.meta);
			setAggregates(payload.aggregates);
			if (payload.meta.totalPages > 0 && page > payload.meta.totalPages) {
				setPage(payload.meta.totalPages);
			}
			if (payload.meta.totalPages === 0 && page !== 1) {
				setPage(1);
			}
		} catch (fetchError) {
			console.error("Failed to fetch logs", fetchError);
			setLogs([]);
			setMeta(null);
			setAggregates(null);
			setError(t("messages.genericError"));
		} finally {
			setLoading(false);
		}
	}, [filters.endDate, filters.level, filters.startDate, page, t]);

	useEffect(() => {
		void fetchLogs();
	}, [fetchLogs]);

	const handleResetFilters = useCallback(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		setPendingFilters({ level: "", startDate: "", endDate: "" });
		setFilters({ level: "", startDate: "", endDate: "" });
		setError(null);
		setPage(1);
	}, []);

	const levelCounts = useMemo(() => {
		const counts = aggregates?.byLevel ?? {};
		return LEVEL_ORDER.map((level) => ({
			level,
			value: counts[level] ?? 0,
		}));
	}, [aggregates]);

	const levelOptions = useMemo(
		() => [
			{
				label: t("filters.levelAll"),
				value: ALL_LEVEL_SELECT_VALUE as LevelSelectValue,
			},
			...LEVEL_ORDER.map((level) => ({
				label: level,
				value: level as LevelSelectValue,
			})),
		],
		[t],
	);

	const selectedLevelValue = useMemo<LevelSelectValue>(
		() =>
			pendingFilters.level === ""
				? ALL_LEVEL_SELECT_VALUE
				: (pendingFilters.level as LevelSelectValue),
		[pendingFilters.level],
	);

	useEffect(() => {
		const validationMessage = t("messages.invalidDateRange");

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			const hasInvalidRange =
				pendingFilters.startDate !== "" &&
				pendingFilters.endDate !== "" &&
				pendingFilters.startDate > pendingFilters.endDate;

			if (hasInvalidRange) {
				setError(validationMessage);
				return;
			}

			if (error === validationMessage) {
				setError(null);
			}

			const hasChanges =
				filters.level !== pendingFilters.level ||
				filters.startDate !== pendingFilters.startDate ||
				filters.endDate !== pendingFilters.endDate;

			if (hasChanges) {
				setFilters({ ...pendingFilters });
				setPage(1);
			}
		}, 350);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [pendingFilters, filters, error, t]);

	const paginationSummary = useMemo(() => {
		if (!meta) {
			return null;
		}

		if (meta.totalPages === 0) {
			return t("pagination.empty");
		}

		return t("pagination.summary", {
			page: meta.page,
			totalPages: meta.totalPages,
		});
	}, [meta, t]);

	const showingSummary = useMemo(() => {
		if (!meta) {
			return t("showingLogs", {
				count: logs.length,
				total: logs.length,
				page: page,
				totalPages: 1,
			});
		}

		return t("showingLogs", {
			count: logs.length,
			total: meta.totalCount,
			page: meta.page,
			totalPages: meta.totalPages,
		});
	}, [logs.length, meta, page, t]);

	return (
		<AdminDashboardLayout
			backLinkLabel={tAdmin("backToAdminDashboard")}
			title={t("title")}
			description={t("description")}
		>
			<section className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
					<div className="flex flex-row justify-start items-center flex-wrap gap-4">
						<Select<LevelSelectValue>
							label={t("filters.level")}
							values={levelOptions}
							defaultValue={selectedLevelValue}
							onChange={(value) =>
								setPendingFilters((previous) => ({
									...previous,
									level:
										value === ALL_LEVEL_SELECT_VALUE
											? ""
											: (value as LOG_LEVEL),
								}))
							}
							placeholder={t("filters.levelAll")}
							ariaLabel={t("filters.level")}
						/>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={startDateInputId}>{t("filters.start")}</Label>
							<Input
								id={startDateInputId}
								type="date"
								value={pendingFilters.startDate}
								onChange={(event) =>
									setPendingFilters((previous) => ({
										...previous,
										startDate: event.target.value,
									}))
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={endDateInputId}>{t("filters.end")}</Label>
							<Input
								id={endDateInputId}
								type="date"
								value={pendingFilters.endDate}
								onChange={(event) =>
									setPendingFilters((previous) => ({
										...previous,
										endDate: event.target.value,
									}))
								}
							/>
						</div>
					</div>
					<Button onClick={handleResetFilters} variant="outline">
						{t("filters.reset")}
					</Button>
				</div>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{levelCounts.map((item) => (
						<div
							key={item.level}
							className="rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5"
						>
							<div className="flex items-center justify-between">
								<span className="font-medium text-slate-700 dark:text-slate-200">
									{item.level}
								</span>
								<span className="text-base font-semibold text-slate-900 dark:text-white">
									{item.value}
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
					<p className="text-sm text-slate-600 dark:text-slate-300">
						{showingSummary}
					</p>
				</div>

				{error && <InfoBox variant="error">{error}</InfoBox>}

				{loading || logs.length === 0 ? (
					<div className="rounded-xl border border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
						{loading ? t("messages.loading") : t("noLogs")}
					</div>
				) : (
					<div className="space-y-4">
						{logs.map((log) => {
							const timestamp = new Date(log.timestamp);
							const absoluteTime = format.dateTime(timestamp, {
								dateStyle: "medium",
								timeStyle: "medium",
							});

							return (
								<article
									key={log.id}
									className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
								>
									<header className="flex flex-wrap items-start justify-between gap-4">
										<div>
											<time
												dateTime={log.timestamp}
												className="text-sm font-medium text-slate-800 dark:text-slate-100"
											>
												{absoluteTime}
											</time>
											<div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
												<span>{format.relativeTime(timestamp, now)}</span>
												{log.scope && <Tag variant="info">{log.scope}</Tag>}
												{log.requestId && (
													<Tag variant="neutral" mono>
														{t("requestId", { id: log.requestId })}
													</Tag>
												)}
											</div>
										</div>
										<LevelBadge level={log.level} />
									</header>

									<p className="mt-4 text-sm text-slate-700 dark:text-slate-200">
										{log.message}
									</p>

									<dl className="mt-4 grid gap-3 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
										<div>
											<dt className="font-medium text-slate-600 dark:text-slate-300">
												{t("user")}
											</dt>
											<dd className="mt-1">
												{log.user ? (
													<div className="space-y-1">
														<p>{log.user.email}</p>
														{log.user.name && (
															<p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
																{log.user.name}
															</p>
														)}
													</div>
												) : (
													<span>{t("systemUser")}</span>
												)}
											</dd>
										</div>
										<div>
											<dt className="font-medium text-slate-600 dark:text-slate-300">
												{t("metadata")}
											</dt>
											<dd className="mt-1">
												<MetadataViewer metadata={log.metadata} />
											</dd>
										</div>
									</dl>
								</article>
							);
						})}
					</div>
				)}

				<div className="flex flex-wrap items-center justify-between gap-4">
					<p className="text-xs text-slate-500 dark:text-slate-400">
						{paginationSummary}
					</p>
					<div className="flex items-center gap-2">
						<Button
							size="small"
							variant="outline"
							type="button"
							onClick={() => setPage((value) => Math.max(1, value - 1))}
							disabled={loading || !(meta?.hasPreviousPage ?? false)}
						>
							<ArrowLeftIcon className="mr-2 size-4" />
							{t("pagination.previous")}
						</Button>
						<Button
							size="small"
							variant="outline"
							type="button"
							onClick={() => setPage((value) => value + 1)}
							disabled={loading || !(meta?.hasNextPage ?? false)}
						>
							{t("pagination.next")}
							<ArrowRightIcon className="ml-2 size-4" />
						</Button>
					</div>
				</div>
			</section>
		</AdminDashboardLayout>
	);
};
export default AdminLogsPage;
