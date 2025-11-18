import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";

function validatePeriodIds(periodIds: unknown): string[] {
	if (!Array.isArray(periodIds)) {
		return [];
	}

	const ids = periodIds.filter(
		(value): value is string => typeof value === "string",
	);

	if (ids.length !== periodIds.length) {
		throw new Error("All periodIds must be strings");
	}

	return Array.from(new Set(ids));
}

const ROUTE_SCOPE = "api:admin/config/absence-units";

export async function POST(req: Request): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#POST`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	let body: { label?: unknown; periodIds?: unknown };
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received");
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body.label !== "string" || body.label.trim().length === 0) {
		await scopedLogger.warn("Missing absence unit label");
		return Response.json({ error: "label is required" }, { status: 400 });
	}

	let periodIds: string[];
	try {
		periodIds = validatePeriodIds(body.periodIds);
	} catch (error) {
		await scopedLogger.warn("Invalid periodIds", {
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid periodIds" },
			{ status: 400 },
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const unit = await tx.absenceUnit.create({
			data: {
				label: body.label as string,
			},
		});

		if (periodIds.length > 0) {
			await tx.absenceUnitPeriod.createMany({
				data: periodIds.map((periodId) => ({ unitId: unit.id, periodId })),
			});
		}

		return {
			id: unit.id,
			label: unit.label,
			periodIds,
		};
	});

	await scopedLogger.info("Created absence unit", {
		unitId: result.id,
		periodCount: periodIds.length,
	});

	return Response.json({ absenceUnit: result }, { status: 201 });
}
