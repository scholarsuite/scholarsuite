import type { LOG_LEVEL } from "#prisma/enums";

export type AdminLogUser = {
	id: string;
	email: string;
	name: string | null;
};

export type AdminLogEntry = {
	id: string;
	timestamp: string;
	level: LOG_LEVEL;
	message: string;
	scope: string | null;
	requestId: string | null;
	metadata: unknown;
	user: AdminLogUser | null;
};

export type AdminLogFilters = {
	level?: LOG_LEVEL | null;
	startDate?: string | null;
	endDate?: string | null;
};

export type AdminLogsMeta = {
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export type AdminLogsAggregates = {
	byLevel: Partial<Record<LOG_LEVEL, number>>;
};

export type AdminLogsResponse = {
	data: AdminLogEntry[];
	meta: AdminLogsMeta;
	filters: AdminLogFilters;
	aggregates: AdminLogsAggregates;
};

export const ADMIN_LOGS_PAGE_SIZE_DEFAULT = 25;
export const ADMIN_LOGS_PAGE_SIZE_MAX = 100;
export const ADMIN_LOG_RETENTION_DAYS = 30;
