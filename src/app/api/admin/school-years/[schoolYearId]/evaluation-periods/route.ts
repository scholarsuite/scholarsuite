import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { addEvaluationPeriod } from "#lib/db/school-year.ts";
import { createApiLogger } from "#lib/logging.ts";
import type { CreateEvaluationPeriodRequest } from "#types/admin/schoolYear.ts";

const ROUTE_SCOPE = "api:admin/school-years/[schoolYearId]/evaluation-periods";

function validateCreatePayload(body: unknown): CreateEvaluationPeriodRequest {
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

	let order: number | undefined;
	if (payload.order !== undefined) {
		if (typeof payload.order !== "number" || !Number.isFinite(payload.order)) {
			throw new Error("order must be a positive integer");
		}
		if (payload.order <= 0) {
			throw new Error("order must be greater than zero");
		}
		order = Math.floor(payload.order);
	}

	return {
		label: rawLabel.trim(),
		startsAt: startsAt.toISOString(),
		endsAt: endsAt.toISOString(),
		order,
	};
}

export async function POST(
	req: Request,
	context: RouteContext<"/api/admin/school-years/[schoolYearId]/evaluation-periods">,
): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#POST`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	const params = await context.params;
	const schoolYearId = params.schoolYearId;
	if (!schoolYearId) {
		await scopedLogger.warn("Missing schoolYearId parameter");
		return Response.json({ error: "Missing schoolYearId" }, { status: 400 });
	}

	let rawBody: unknown;
	try {
		rawBody = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received", { schoolYearId });
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	let validated: CreateEvaluationPeriodRequest;
	try {
		validated = validateCreatePayload(rawBody);
	} catch (error) {
		await scopedLogger.warn("Invalid create payload", {
			schoolYearId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid payload" },
			{ status: 400 },
		);
	}

	const updated = await addEvaluationPeriod(schoolYearId, validated);
	if (!updated) {
		await scopedLogger.warn("School year not found when creating period", {
			schoolYearId,
		});
		return Response.json({ error: "School year not found" }, { status: 404 });
	}

	await scopedLogger.info("Added evaluation period", { schoolYearId });

	return Response.json({ schoolYear: updated }, { status: 201 });
}
