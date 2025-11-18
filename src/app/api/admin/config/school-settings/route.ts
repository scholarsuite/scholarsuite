import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";

const ROUTE_SCOPE = "api:admin/config/school-settings";

export async function PUT(req: Request): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#PUT`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	let body: { schoolName?: unknown };
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received");
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (
		typeof body.schoolName !== "string" ||
		body.schoolName.trim().length === 0
	) {
		await scopedLogger.warn("Missing schoolName value");
		return Response.json({ error: "schoolName is required" }, { status: 400 });
	}

	const schoolName = body.schoolName.trim();

	const existing = await prisma.schoolSettings.findFirst();

	const result = existing
		? await prisma.schoolSettings.update({
				where: { id: existing.id },
				data: { schoolName },
			})
		: await prisma.schoolSettings.create({
				data: { schoolName },
			});

	await scopedLogger.info("Updated school settings", {
		schoolSettingsId: result.id,
	});

	return Response.json({
		schoolSettings: {
			id: result.id,
			schoolName: result.schoolName,
		},
	});
}
