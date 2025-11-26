import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { getSchoolYearById } from "#lib/db/school-year.ts";
import { createApiLogger } from "#lib/logging.ts";

const ROUTE_SCOPE = "api:admin/school-years/[schoolYearId]";

export async function GET(
	req: Request,
	context: RouteContext<"/api/admin/school-years/[schoolYearId]">,
): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#GET`);
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

	const schoolYear = await getSchoolYearById(schoolYearId);
	if (!schoolYear) {
		await scopedLogger.warn("School year not found", { schoolYearId });
		return Response.json({ error: "School year not found" }, { status: 404 });
	}

	await scopedLogger.info("Fetched school year", { schoolYearId });

	return Response.json({ schoolYear });
}
