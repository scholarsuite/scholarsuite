import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createSchoolYear, listSchoolYears } from "#lib/db/school-year.ts";
import { createApiLogger } from "#lib/logging.ts";
import type { CreateSchoolYearRequest } from "#types/admin/schoolYear.ts";

const ROUTE_SCOPE = "api:admin/school-years";

function validateCreatePayload(body: unknown): CreateSchoolYearRequest {
	if (!body || typeof body !== "object") {
		throw new Error("Invalid payload");
	}

	const payload = body as Record<string, unknown>;

	const rawLabel = payload.label;
	if (typeof rawLabel !== "string" || rawLabel.trim().length === 0) {
		throw new Error("label is required");
	}

	const rawStartsAt = payload.startsAt;
	if (typeof rawStartsAt !== "string" || rawStartsAt.trim().length === 0) {
		throw new Error("startsAt is required");
	}

	const rawEndsAt = payload.endsAt;
	if (typeof rawEndsAt !== "string" || rawEndsAt.trim().length === 0) {
		throw new Error("endsAt is required");
	}

	const startsAt = new Date(rawStartsAt);
	const endsAt = new Date(rawEndsAt);
	if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
		throw new Error("Invalid date range");
	}
	if (startsAt > endsAt) {
		throw new Error("startsAt must be before or equal to endsAt");
	}

	let levels: string[] | undefined;
	if (payload.levels !== undefined) {
		if (!Array.isArray(payload.levels)) {
			throw new Error("levels must be an array of strings");
		}
		levels = payload.levels
			.map((level) => (typeof level === "string" ? level.trim() : ""))
			.filter((level) => level.length > 0);
	}

	return {
		label: rawLabel.trim(),
		startsAt: startsAt.toISOString(),
		endsAt: endsAt.toISOString(),
		levels,
	};
}

export async function GET(req: Request): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#GET`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	const payload = await listSchoolYears();

	await scopedLogger.info("Listed school years", {
		count: payload.schoolYears.length,
	});

	return Response.json(payload);
}

export async function POST(req: Request): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#POST`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	let rawBody: unknown;
	try {
		rawBody = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received");
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	let validated: CreateSchoolYearRequest;
	try {
		validated = validateCreatePayload(rawBody);
	} catch (error) {
		await scopedLogger.warn("Invalid create payload", {
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid payload" },
			{ status: 400 },
		);
	}

	try {
		const created = await createSchoolYear(validated);

		await scopedLogger.info("Created school year", {
			schoolYearId: created.id,
		});

		return Response.json({ schoolYear: created }, { status: 201 });
	} catch (error) {
		await scopedLogger.error("Failed to create school year", {
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to create school year" },
			{ status: 500 },
		);
	}
}
