import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";
import { Prisma } from "#prisma/client";

const ROUTE_SCOPE = "api:admin/config/levels/[levelId]";

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/levels/[levelId]">,
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
	const levelId = params.levelId;
	if (!levelId) {
		await scopedLogger.warn("Missing levelId parameter");
		return Response.json({ error: "Missing levelId" }, { status: 400 });
	}

	let body: { label?: unknown; order?: unknown };
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received", { levelId });
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const data: Prisma.LevelUpdateInput = {};

	if (body.label !== undefined) {
		if (typeof body.label !== "string" || body.label.trim().length === 0) {
			await scopedLogger.warn("Invalid level label", { levelId });
			return Response.json({ error: "Invalid label" }, { status: 400 });
		}
		data.label = body.label.trim();
	}

	if (body.order !== undefined) {
		if (typeof body.order !== "number" || !Number.isInteger(body.order)) {
			await scopedLogger.warn("Invalid level order", {
				levelId,
				order: body.order,
			});
			return Response.json({ error: "Invalid order" }, { status: 400 });
		}
		data.order = body.order;
	}

	if (Object.keys(data).length === 0) {
		await scopedLogger.warn("No fields provided for update", { levelId });
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	try {
		const level = await prisma.level.update({
			where: { id: levelId },
			data,
		});

		await scopedLogger.info("Updated level", { levelId });

		return Response.json({
			level: {
				id: level.id,
				label: level.label,
				order: level.order,
			},
		});
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			await scopedLogger.warn("Level not found during update", { levelId });
			return Response.json({ error: "Level not found" }, { status: 404 });
		}

		await scopedLogger.error("Failed to update level", {
			levelId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json({ error: "Failed to update level" }, { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	context: RouteContext<"/api/admin/config/levels/[levelId]">,
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
	const levelId = params.levelId;
	if (!levelId) {
		await scopedLogger.warn("Missing levelId parameter");
		return Response.json({ error: "Missing levelId" }, { status: 400 });
	}

	try {
		await prisma.level.delete({ where: { id: levelId } });
		await scopedLogger.info("Deleted level", { levelId });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				await scopedLogger.warn("Level not found during delete", { levelId });
				return Response.json({ error: "Level not found" }, { status: 404 });
			}

			if (error.code === "P2003") {
				await scopedLogger.warn("Cannot delete level with related records", {
					levelId,
				});
				return Response.json(
					{ error: "Cannot delete level with related records" },
					{ status: 409 },
				);
			}
		}

		await scopedLogger.error("Failed to delete level", {
			levelId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json({ error: "Failed to delete level" }, { status: 500 });
	}
}
