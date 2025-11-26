import Link from "next/link";
import { getFormatter, getNow, getTranslations } from "next-intl/server";
import { LevelBadge } from "#components/admin/logs/LevelBadge.tsx";
import { MetadataViewer } from "#components/Common/MetadataViewer.tsx";
import { Tag } from "#components/Common/Tag.tsx";
import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";
import { prisma } from "#lib/prisma.ts";
import { LOG_LEVEL } from "#prisma/client";

export const revalidate = 0;

const LOG_LIMIT = 150;

const levelOrder: readonly LOG_LEVEL[] = [
	LOG_LEVEL.ERROR,
	LOG_LEVEL.WARN,
	LOG_LEVEL.INFO,
	LOG_LEVEL.DEBUG,
];

type SerializedLog = {
	id: string;
	timestamp: string;
	level: LOG_LEVEL;
	message: string;
	scope: string | null;
	requestId: string | null;
	metadata: unknown;
	user: {
		id: string;
		email: string;
		name: string | null;
	} | null;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractMetadata(input: unknown): {
	scope: string | null;
	requestId: string | null;
	metadata: unknown;
} {
	if (!isPlainObject(input)) {
		return {
			scope: null,
			requestId: null,
			metadata: input ?? null,
		};
	}

	const { scope, requestId, ...rest } = input;

	const normalizedScope = typeof scope === "string" ? scope : null;
	const normalizedRequestId = typeof requestId === "string" ? requestId : null;
	const hasRest = Object.keys(rest).length > 0;

	return {
		scope: normalizedScope,
		requestId: normalizedRequestId,
		metadata: hasRest ? rest : null,
	};
}

async function getRecentLogs(): Promise<SerializedLog[]> {
	const entries = await prisma.log.findMany({
		take: LOG_LIMIT,
		orderBy: { timestamp: "desc" },
		include: {
			user: {
				select: {
					id: true,
					email: true,
					name: true,
				},
			},
		},
	});

	return entries.map((entry) => {
		const { scope, requestId, metadata } = extractMetadata(entry.metadata);

		return {
			id: entry.id,
			timestamp: entry.timestamp.toISOString(),
			level: entry.level,
			message: entry.message,
			scope,
			requestId,
			metadata,
			user: entry.user
				? {
						id: entry.user.id,
						email: entry.user.email,
						name: entry.user.name,
					}
				: null,
		} satisfies SerializedLog;
	});
}

/**
 * todo(@AugustinMauroy): move server logic to rest api route
 * and add pagination + filtering capabilities
 */
export default async function AdminLogsPage() {
	const t = await getTranslations("app.admin");
	const now = await getNow();
	const format = await getFormatter();

	const logs = await getRecentLogs();

	const levelCounts = {} as Record<LOG_LEVEL, number>;
	for (const level of Object.values(LOG_LEVEL) as LOG_LEVEL[]) {
		levelCounts[level] = 0;
	}

	for (const log of logs) {
		levelCounts[log.level] += 1;
	}

	return (
		<AdminDashboardLayout
			backLinkLabel={t("backToAdminDashboard")}
			title={t("logs.title")}
			description={t("logs.description")}
			actions={
				<Link
					href="/admin/logs"
					className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
					prefetch={false}
				>
					{t("refresh")}
				</Link>
			}
		>
			<section className="space-y-6">
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{levelOrder.map((level) => (
						<div
							key={level}
							className="rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5"
						>
							<div className="flex items-center justify-between">
								<span className="font-medium text-slate-700 dark:text-slate-200">
									{level}
								</span>
								<span className="text-base font-semibold text-slate-900 dark:text-white">
									{levelCounts[level] ?? 0}
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
					<p className="text-sm text-slate-600 dark:text-slate-300">
						{t("logs.showingLogs", { count: logs.length, limit: LOG_LIMIT })}
					</p>
				</div>

				{logs.length === 0 ? (
					<div className="rounded-xl border border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
						{t("logs.noLogs")}
					</div>
				) : (
					<div className="space-y-4">
						{logs.map((log) => {
							const absoluteTime = format.dateTime(new Date(log.timestamp), {
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
												<span>
													{format.relativeTime(new Date(log.timestamp), now)}
												</span>
												{log.scope ? (
													<Tag variant="info">{log.scope}</Tag>
												) : null}
												{log.requestId ? (
													<Tag variant="neutral" mono>
														{t("logs.requestId", { id: log.requestId })}
													</Tag>
												) : null}
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
												{t("logs.user")}
											</dt>
											<dd className="mt-1">
												{log.user ? (
													<div className="space-y-1">
														<p>{log.user.email}</p>
														{log.user.name ? (
															<p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
																{log.user.name}
															</p>
														) : null}
													</div>
												) : (
													<span>{t("logs.systemUser")}</span>
												)}
											</dd>
										</div>
										<div>
											<dt className="font-medium text-slate-600 dark:text-slate-300">
												{t("logs.metadata")}
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
			</section>
		</AdminDashboardLayout>
	);
}
