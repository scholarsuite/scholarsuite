import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";
import { Prisma } from "#prisma/client";

const ROUTE_SCOPE = "api:admin/config/subject-categories/[categoryId]";

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/subject-categories/[categoryId]">,
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
	const categoryId = params.categoryId;
	if (!categoryId) {
		await scopedLogger.warn("Missing categoryId parameter");
		return Response.json({ error: "Missing categoryId" }, { status: 400 });
	}

	let body: { label?: unknown; order?: unknown };
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received", { categoryId });
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const data: { label?: string; order?: number } = {};

	if (body.label !== undefined) {
		if (typeof body.label !== "string" || body.label.trim().length === 0) {
			await scopedLogger.warn("Invalid subject category label", {
				categoryId,
			});
			return Response.json({ error: "Invalid label" }, { status: 400 });
		}
		data.label = body.label.trim();
	}

	if (body.order !== undefined) {
		if (typeof body.order !== "number" || !Number.isInteger(body.order)) {
			await scopedLogger.warn("Invalid subject category order", {
				categoryId,
				order: body.order,
			});
			return Response.json({ error: "Invalid order" }, { status: 400 });
		}
		data.order = body.order;
	}

	if (Object.keys(data).length === 0) {
		await scopedLogger.warn("No fields provided for update", { categoryId });
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	try {
		const category = await prisma.subjectCategory.update({
			where: { id: categoryId },
			data,
		});

		await scopedLogger.info("Updated subject category", { categoryId });

		return Response.json({
			subjectCategory: {
				id: category.id,
				label: category.label,
				order: category.order,
			},
		});
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			await scopedLogger.warn("Subject category not found during update", {
				categoryId,
			});
			return Response.json(
				{ error: "Subject category not found" },
				{ status: 404 },
			);
		}

		await scopedLogger.error("Failed to update subject category", {
			categoryId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to update subject category" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	req: Request,
	context: RouteContext<"/api/admin/config/subject-categories/[categoryId]">,
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
	const categoryId = params.categoryId;
	if (!categoryId) {
		await scopedLogger.warn("Missing categoryId parameter");
		return Response.json({ error: "Missing categoryId" }, { status: 400 });
	}

	try {
		await prisma.subjectCategory.delete({ where: { id: categoryId } });
		await scopedLogger.info("Deleted subject category", { categoryId });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				await scopedLogger.warn("Subject category not found during delete", {
					categoryId,
				});
				return Response.json(
					{ error: "Subject category not found" },
					{ status: 404 },
				);
			}

			if (error.code === "P2003") {
				await scopedLogger.warn(
					"Cannot delete subject category with related subjects",
					{ categoryId },
				);
				return Response.json(
					{ error: "Cannot delete subject category with related subjects" },
					{ status: 409 },
				);
			}
		}

		await scopedLogger.error("Failed to delete subject category", {
			categoryId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to delete subject category" },
			{ status: 500 },
		);
	}
}
