import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";
import { Prisma } from "#prisma/client";

function parseOptionalDate(value: unknown, field: string): Date | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (value === null) {
		throw new Error(`${field} cannot be null`);
	}

	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`${field} must be a non-empty string`);
	}

	const date = new Date(value);
	if (Number.isNaN(Number(date))) {
		throw new Error(`${field} must be a valid date string`);
	}

	return date;
}

const ROUTE_SCOPE = "api:admin/config/course-periods/[coursePeriodId]";

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/course-periods/[coursePeriodId]">,
): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#PATCH`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	const params = await context.params;
	const coursePeriodId = params.coursePeriodId;
	if (!coursePeriodId) {
		await scopedLogger.warn("Missing coursePeriodId parameter");
		return Response.json({ error: "Missing coursePeriodId" }, { status: 400 });
	}

	let body: {
		label?: unknown;
		startsAt?: unknown;
		endsAt?: unknown;
		order?: unknown;
	};
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received", {
			coursePeriodId,
		});
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const data: Prisma.CoursePeriodUpdateInput = {};

	if (body.label !== undefined) {
		if (typeof body.label !== "string" || body.label.trim().length === 0) {
			await scopedLogger.warn("Invalid course period label", {
				coursePeriodId,
			});
			return Response.json({ error: "Invalid label" }, { status: 400 });
		}
		data.label = body.label.trim();
	}

	if (body.order !== undefined) {
		if (typeof body.order !== "number" || !Number.isInteger(body.order)) {
			await scopedLogger.warn("Invalid course period order", {
				coursePeriodId,
				order: body.order,
			});
			return Response.json({ error: "Invalid order" }, { status: 400 });
		}
		data.order = body.order;
	}

	try {
		const startsAt = parseOptionalDate(body.startsAt, "startsAt");
		if (startsAt) {
			data.startsAt = startsAt;
		}

		const endsAt = parseOptionalDate(body.endsAt, "endsAt");
		if (endsAt) {
			data.endsAt = endsAt;
		}
	} catch (error) {
		await scopedLogger.warn("Invalid course period dates", {
			coursePeriodId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid dates" },
			{ status: 400 },
		);
	}

	if (Object.keys(data).length === 0) {
		await scopedLogger.warn("No fields provided for update", {
			coursePeriodId,
		});
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	try {
		const period = await prisma.coursePeriod.update({
			where: { id: coursePeriodId },
			data,
		});

		await scopedLogger.info("Updated course period", { coursePeriodId });

		return Response.json({
			coursePeriod: {
				id: period.id,
				label: period.label,
				startsAt: period.startsAt.toISOString(),
				endsAt: period.endsAt.toISOString(),
				order: period.order,
			},
		});
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			await scopedLogger.warn("Course period not found during update", {
				coursePeriodId,
			});
			return Response.json(
				{ error: "Course period not found" },
				{ status: 404 },
			);
		}

		await scopedLogger.error("Failed to update course period", {
			coursePeriodId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to update course period" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	req: Request,
	context: RouteContext<"/api/admin/config/course-periods/[coursePeriodId]">,
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
	const coursePeriodId = params.coursePeriodId;
	if (!coursePeriodId) {
		await scopedLogger.warn("Missing coursePeriodId parameter");
		return Response.json({ error: "Missing coursePeriodId" }, { status: 400 });
	}

	try {
		await prisma.coursePeriod.delete({ where: { id: coursePeriodId } });
		await scopedLogger.info("Deleted course period", { coursePeriodId });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				await scopedLogger.warn("Course period not found during delete", {
					coursePeriodId,
				});
				return Response.json(
					{ error: "Course period not found" },
					{ status: 404 },
				);
			}

			if (error.code === "P2003") {
				await scopedLogger.warn(
					"Cannot delete course period with related records",
					{ coursePeriodId },
				);
				return Response.json(
					{ error: "Cannot delete course period with related records" },
					{ status: 409 },
				);
			}
		}

		await scopedLogger.error("Failed to delete course period", {
			coursePeriodId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to delete course period" },
			{ status: 500 },
		);
	}
}
