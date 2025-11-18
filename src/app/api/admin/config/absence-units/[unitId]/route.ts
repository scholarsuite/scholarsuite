import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";
import { Prisma } from "#prisma/client";

function validatePeriodIds(periodIds: unknown): string[] {
	if (!Array.isArray(periodIds)) {
		throw new Error("periodIds must be an array of strings");
	}

	const ids = periodIds.filter(
		(value): value is string => typeof value === "string",
	);

	if (ids.length !== periodIds.length) {
		throw new Error("All periodIds must be strings");
	}

	return Array.from(new Set(ids));
}

const ROUTE_SCOPE = "api:admin/config/absence-units/[unitId]";

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/absence-units/[unitId]">,
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
	const unitId = params.unitId;
	if (!unitId) {
		await scopedLogger.warn("Missing unitId parameter");
		return Response.json({ error: "Missing unitId" }, { status: 400 });
	}

	let body: { label?: unknown; periodIds?: unknown };
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received", { unitId });
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (body.label === undefined && body.periodIds === undefined) {
		await scopedLogger.warn("No fields provided for update", { unitId });
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	let labelUpdate: string | undefined;
	if (body.label !== undefined) {
		if (typeof body.label !== "string" || body.label.trim().length === 0) {
			await scopedLogger.warn("Invalid absence unit label", { unitId });
			return Response.json({ error: "Invalid label" }, { status: 400 });
		}
		labelUpdate = body.label.trim();
	}

	let periodIds: string[] | undefined;
	if (body.periodIds !== undefined) {
		try {
			periodIds = validatePeriodIds(body.periodIds);
		} catch (error) {
			await scopedLogger.warn("Invalid periodIds", {
				unitId,
				reason: error instanceof Error ? error.message : "Unknown error",
			});
			return Response.json(
				{ error: error instanceof Error ? error.message : "Invalid periodIds" },
				{ status: 400 },
			);
		}
	}

	try {
		const updated = await prisma.$transaction(async (tx) => {
			const unit = await tx.absenceUnit.findUnique({
				where: { id: unitId },
			});

			if (!unit) {
				throw new Error("UNIT_NOT_FOUND");
			}

			if (labelUpdate !== undefined) {
				await tx.absenceUnit.update({
					where: { id: unitId },
					data: { label: labelUpdate },
				});
			}

			if (periodIds !== undefined) {
				await tx.absenceUnitPeriod.deleteMany({ where: { unitId } });
				if (periodIds.length > 0) {
					await tx.absenceUnitPeriod.createMany({
						data: periodIds.map((periodId) => ({ unitId, periodId })),
					});
				}
			}

			const refreshed = await tx.absenceUnit.findUnique({
				where: { id: unitId },
				include: { periodLinks: true },
			});

			if (!refreshed) {
				throw new Error("UNIT_NOT_FOUND");
			}

			return {
				id: refreshed.id,
				label: refreshed.label,
				periodIds: refreshed.periodLinks.map((link) => link.periodId),
			};
		});

		await scopedLogger.info("Updated absence unit", {
			unitId,
			periodCount: updated.periodIds.length,
		});

		return Response.json({ absenceUnit: updated });
	} catch (error) {
		if (error instanceof Error && error.message === "UNIT_NOT_FOUND") {
			await scopedLogger.warn("Absence unit not found during update", {
				unitId,
			});
			return Response.json(
				{ error: "Absence unit not found" },
				{ status: 404 },
			);
		}

		await scopedLogger.error("Failed to update absence unit", {
			unitId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to update absence unit" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	req: Request,
	context: RouteContext<"/api/admin/config/absence-units/[unitId]">,
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
	const unitId = params.unitId;
	if (!unitId) {
		await scopedLogger.warn("Missing unitId parameter");
		return Response.json({ error: "Missing unitId" }, { status: 400 });
	}

	try {
		await prisma.absenceUnit.delete({ where: { id: unitId } });
		await scopedLogger.info("Deleted absence unit", { unitId });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				await scopedLogger.warn("Absence unit not found during delete", {
					unitId,
				});
				return Response.json(
					{ error: "Absence unit not found" },
					{ status: 404 },
				);
			}

			if (error.code === "P2003") {
				await scopedLogger.warn(
					"Cannot delete absence unit with related records",
					{ unitId },
				);
				return Response.json(
					{ error: "Cannot delete absence unit with related records" },
					{ status: 409 },
				);
			}
		}

		await scopedLogger.error("Failed to delete absence unit", {
			unitId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to delete absence unit" },
			{ status: 500 },
		);
	}
}
