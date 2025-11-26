import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import { prisma } from "#lib/prisma.ts";
import type { Prisma } from "#prisma/client";
import { LOG_LEVEL } from "#prisma/enums";
import {
	ADMIN_LOG_RETENTION_DAYS,
	ADMIN_LOGS_PAGE_SIZE_DEFAULT,
	ADMIN_LOGS_PAGE_SIZE_MAX,
	type AdminLogEntry,
	type AdminLogsResponse,
} from "#types/admin/logs.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_USER_SELECT = {
	id: true,
	email: true,
	name: true,
} as const;

const LOG_INCLUDE = {
	user: {
		select: LOG_USER_SELECT,
	},
} as const;

type LogWithUser = Prisma.LogGetPayload<{
	include: typeof LOG_INCLUDE;
}>;

type ParsedQuery = {
	page: number;
	pageSize: number;
	level: LOG_LEVEL | null;
	startDate: Date | null;
	endDate: Date | null;
};

const LEVEL_VALUES = Object.values(LOG_LEVEL) as LOG_LEVEL[];
const LOG_LEVEL_SET = new Set(LEVEL_VALUES);

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;

	const parsed = parseQuery(searchParams);
	if (parsed instanceof NextResponse) {
		return parsed;
	}

	const { page, pageSize, level, startDate, endDate } = parsed;

	const where: Prisma.LogWhereInput = {};
	if (level) {
		where.level = level;
	}

	if (startDate || endDate) {
		where.timestamp = {};
		if (startDate) {
			where.timestamp.gte = startDate;
		}
		if (endDate) {
			where.timestamp.lte = endDate;
		}
	}

	const skip = (page - 1) * pageSize;

	const queries: Array<Prisma.PrismaPromise<unknown>> = [
		prisma.log.findMany({
			where,
			orderBy: { timestamp: "desc" },
			skip,
			take: pageSize,
			include: LOG_INCLUDE,
		}),
		prisma.log.count({ where }),
	];

	if (!level) {
		for (const currentLevel of LEVEL_VALUES) {
			queries.push(
				prisma.log.count({
					where: {
						...where,
						level: currentLevel,
					},
				}),
			);
		}
	}

	const results = await prisma.$transaction(queries);

	const logs = results[0] as LogWithUser[];
	const totalCount = results[1] as number;

	const records = logs.map(serializeLog);

	let levelCounts: Record<LOG_LEVEL, number>;

	if (level) {
		levelCounts = createEmptyLevelCounts();
		levelCounts[level] = totalCount;
	} else {
		const counts = results.slice(2) as number[];
		levelCounts = buildLevelCounts(counts);
	}

	const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
	const payload: AdminLogsResponse = {
		data: records,
		meta: {
			page,
			pageSize,
			totalCount,
			totalPages,
			hasNextPage: page * pageSize < totalCount,
			hasPreviousPage: page > 1,
		},
		filters: {
			level,
			startDate: startDate ? startDate.toISOString() : null,
			endDate: endDate ? endDate.toISOString() : null,
		},
		aggregates: {
			byLevel: levelCounts,
		},
	};

	scheduleCleanup();

	return NextResponse.json(payload, {
		headers: {
			"Cache-Control": "no-store",
		},
	});
}

function parseQuery(params: URLSearchParams): ParsedQuery | NextResponse {
	const pageValue = params.get("page");
	const pageSizeValue = params.get("pageSize");
	const levelValue = params.get("level");
	const startValue = params.get("start");
	const endValue = params.get("end");

	const page = toPositiveInteger(pageValue, 1);
	if (!page) {
		return NextResponse.json({ error: "Invalid page" }, { status: 400 });
	}

	const pageSize = toPositiveInteger(
		pageSizeValue,
		ADMIN_LOGS_PAGE_SIZE_DEFAULT,
	);
	if (!pageSize) {
		return NextResponse.json({ error: "Invalid page size" }, { status: 400 });
	}

	if (pageSize > ADMIN_LOGS_PAGE_SIZE_MAX) {
		return NextResponse.json({ error: "Page size too large" }, { status: 400 });
	}

	let level: LOG_LEVEL | null = null;
	if (levelValue) {
		if (!LOG_LEVEL_SET.has(levelValue as LOG_LEVEL)) {
			return NextResponse.json({ error: "Invalid log level" }, { status: 400 });
		}
		level = levelValue as LOG_LEVEL;
	}

	const startDate = toDate(startValue, { startOfDay: true });
	if (startValue && !startDate) {
		return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
	}

	const endDate = toDate(endValue, { endOfDay: true });
	if (endValue && !endDate) {
		return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
	}

	if (startDate && endDate && startDate > endDate) {
		return NextResponse.json(
			{ error: "Start date must be before end date" },
			{ status: 400 },
		);
	}

	return { page, pageSize, level, startDate, endDate };
}

function toPositiveInteger(
	value: string | null,
	fallback: number,
): number | null {
	if (!value) {
		return fallback;
	}

	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return null;
	}

	return parsed;
}

function toDate(
	value: string | null,
	options?: { startOfDay?: boolean; endOfDay?: boolean },
): Date | null {
	if (!value) {
		return null;
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	if (options?.startOfDay) {
		date.setUTCHours(0, 0, 0, 0);
	}

	if (options?.endOfDay) {
		date.setUTCHours(23, 59, 59, 999);
	}

	return date;
}

function serializeLog(entry: LogWithUser): AdminLogEntry {
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
	};
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createEmptyLevelCounts(): Record<LOG_LEVEL, number> {
	return LEVEL_VALUES.reduce<Record<LOG_LEVEL, number>>(
		(acc, value) => {
			acc[value] = 0;
			return acc;
		},
		{} as Record<LOG_LEVEL, number>,
	);
}

function buildLevelCounts(counts: number[]): Record<LOG_LEVEL, number> {
	const result = createEmptyLevelCounts();
	for (let index = 0; index < LEVEL_VALUES.length; index += 1) {
		result[LEVEL_VALUES[index]] = counts[index] ?? 0;
	}
	return result;
}

function scheduleCleanup() {
	const configuredRetention = process.env.LOG_RETENTION_DAYS;
	const retentionDays = configuredRetention
		? Number.parseInt(configuredRetention, 10)
		: ADMIN_LOG_RETENTION_DAYS;

	if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
		return;
	}

	const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

	after(async () => {
		try {
			await prisma.log.deleteMany({
				where: {
					timestamp: { lt: cutoff },
				},
			});
		} catch (error) {
			console.error("Failed to purge old logs", error);
		}
	});
}
