import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";

function parseDate(value: unknown, field: string): Date {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`${field} is required`);
	}
	const date = new Date(value);
	if (Number.isNaN(Number(date))) {
		throw new Error(`${field} must be a valid date string`);
	}
	return date;
}

const ROUTE_SCOPE = "api:admin/config/course-periods";

export async function POST(req: Request): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#POST`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	let body: {
		label?: unknown;
		startsAt?: unknown;
		endsAt?: unknown;
		order?: unknown;
	};
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received");
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body.label !== "string" || body.label.trim().length === 0) {
		await scopedLogger.warn("Missing course period label");
		return Response.json({ error: "label is required" }, { status: 400 });
	}

	if (typeof body.order !== "number" || !Number.isInteger(body.order)) {
		await scopedLogger.warn("Invalid course period order", {
			order: body.order,
		});
		return Response.json(
			{ error: "order must be an integer" },
			{ status: 400 },
		);
	}

	let startsAt: Date;
	let endsAt: Date;
	try {
		startsAt = parseDate(body.startsAt, "startsAt");
		endsAt = parseDate(body.endsAt, "endsAt");
	} catch (error) {
		await scopedLogger.warn("Invalid course period dates", {
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid dates" },
			{ status: 400 },
		);
	}

	const period = await prisma.coursePeriod.create({
		data: {
			label: body.label.trim(),
			startsAt,
			endsAt,
			order: body.order,
		},
	});

	await scopedLogger.info("Created course period", {
		periodId: period.id,
		order: period.order,
	});

	return Response.json(
		{
			coursePeriod: {
				id: period.id,
				label: period.label,
				startsAt: period.startsAt.toISOString(),
				endsAt: period.endsAt.toISOString(),
				order: period.order,
			},
		},
		{ status: 201 },
	);
}
