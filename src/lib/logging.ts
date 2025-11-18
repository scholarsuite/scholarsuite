import { prisma } from "#lib/prisma.ts";
import { LOG_LEVEL } from "#prisma/enums";

export type LoggerContext = {
	scope?: string;
	userId?: string | null;
	requestId?: string | null;
};

export type LogMetadata = Record<string, unknown>;

type LogMethod = (message: string, metadata?: LogMetadata) => Promise<void>;

type InternalLogger = {
	debug: LogMethod;
	info: LogMethod;
	warn: LogMethod;
	error: LogMethod;
	with(context: Partial<LoggerContext>): InternalLogger;
	readonly context: LoggerContext;
};

function mergeMetadata(
	context: LoggerContext,
	metadata?: LogMetadata,
): LogMetadata | undefined {
	const { userId: _ignoredUserId, ...contextMetadata } = context;
	const hasContextMetadata = Object.keys(contextMetadata).length > 0;

	if (!metadata && !hasContextMetadata) {
		return undefined;
	}

	if (!metadata) {
		return contextMetadata;
	}

	if (!hasContextMetadata) {
		return metadata;
	}

	return { ...contextMetadata, ...metadata };
}

async function persistLog(
	level: LOG_LEVEL,
	message: string,
	context: LoggerContext,
	metadata?: LogMetadata,
): Promise<void> {
	type PrismaMetadata = Parameters<
		typeof prisma.log.create
	>[0]["data"]["metadata"];

	const { LOG_LEVEL: envLogLevel } = process.env;

	// don't log if level is not valid
	if (!envLogLevel || !(level in LOG_LEVEL)) return;

	// don't log if level is lower than the configured level
	const configuredLevel = LOG_LEVEL[envLogLevel as keyof typeof LOG_LEVEL];
	if (level > configuredLevel) return;

	try {
		await prisma.log.create({
			data: {
				level,
				message,
				userId: context.userId ?? null,
				metadata: mergeMetadata(context, metadata) as PrismaMetadata,
			},
		});
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			console.error("Failed to persist log", error);
		}
	}
}

export function createLogger(context: LoggerContext = {}): InternalLogger {
	const log = async (
		level: LOG_LEVEL,
		message: string,
		metadata?: LogMetadata,
	) => persistLog(level, message, context, metadata);

	return {
		debug: (message, metadata) => log(LOG_LEVEL.DEBUG, message, metadata),
		info: (message, metadata) => log(LOG_LEVEL.INFO, message, metadata),
		warn: (message, metadata) => log(LOG_LEVEL.WARN, message, metadata),
		error: (message, metadata) => log(LOG_LEVEL.ERROR, message, metadata),
		with(additionalContext) {
			return createLogger({ ...context, ...additionalContext });
		},
		get context() {
			return context;
		},
	};
}

export function createApiLogger(
	scope: string,
	overrides: Partial<LoggerContext> = {},
): InternalLogger {
	const randomSource = globalThis.crypto as
		| { randomUUID?: () => string }
		| undefined;

	return createLogger({
		scope,
		requestId: randomSource?.randomUUID?.(),
		...overrides,
	});
}

export { LOG_LEVEL };
