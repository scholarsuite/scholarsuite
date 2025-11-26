import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { removeEvaluationPeriod } from "#lib/db/school-year.ts";
import { createApiLogger } from "#lib/logging.ts";

const ROUTE_SCOPE =
	"api:admin/school-years/[schoolYearId]/evaluation-periods/[periodId]";

export async function DELETE(
	req: Request,
	context: RouteContext<"/api/admin/school-years/[schoolYearId]/evaluation-periods/[periodId]">,
): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#DELETE`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	const params = await context.params;
	const schoolYearId = params.schoolYearId;
	const periodId = params.periodId;
	if (!schoolYearId || !periodId) {
		await scopedLogger.warn("Missing identifiers", {
			schoolYearId,
			periodId,
		});
		return Response.json({ error: "Missing identifiers" }, { status: 400 });
	}

	const updated = await removeEvaluationPeriod(schoolYearId, periodId);
	if (!updated) {
		await scopedLogger.warn("School year or period not found", {
			schoolYearId,
			periodId,
		});
		return Response.json(
			{ error: "Evaluation period not found" },
			{ status: 404 },
		);
	}

	await scopedLogger.info("Removed evaluation period", {
		schoolYearId,
		periodId,
	});

	return Response.json({ schoolYear: updated });
}
