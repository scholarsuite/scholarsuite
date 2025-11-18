import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";

const ROUTE_SCOPE = "api:admin/config/levels";

export async function POST(req: Request): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#POST`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	let body: { label?: unknown; order?: unknown };
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received");
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body.label !== "string" || body.label.trim().length === 0) {
		await scopedLogger.warn("Missing level label");
		return Response.json({ error: "label is required" }, { status: 400 });
	}

	if (typeof body.order !== "number" || !Number.isInteger(body.order)) {
		await scopedLogger.warn("Invalid level order", { order: body.order });
		return Response.json(
			{ error: "order must be an integer" },
			{ status: 400 },
		);
	}

	const level = await prisma.level.create({
		data: {
			label: body.label.trim(),
			order: body.order,
		},
	});

	await scopedLogger.info("Created level", {
		levelId: level.id,
		order: level.order,
	});

	return Response.json(
		{
			level: {
				id: level.id,
				label: level.label,
				order: level.order,
			},
		},
		{ status: 201 },
	);
}
