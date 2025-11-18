import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
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

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/absence-units/[unitId]">,
): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const unitId = params.unitId;
	if (!unitId) {
		return Response.json({ error: "Missing unitId" }, { status: 400 });
	}

	let body: { label?: unknown; periodIds?: unknown };
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (body.label === undefined && body.periodIds === undefined) {
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	let labelUpdate: string | undefined;
	if (body.label !== undefined) {
		if (typeof body.label !== "string" || body.label.trim().length === 0) {
			return Response.json({ error: "Invalid label" }, { status: 400 });
		}
		labelUpdate = body.label.trim();
	}

	let periodIds: string[] | undefined;
	if (body.periodIds !== undefined) {
		try {
			periodIds = validatePeriodIds(body.periodIds);
		} catch (error) {
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

		return Response.json({ absenceUnit: updated });
	} catch (error) {
		if (error instanceof Error && error.message === "UNIT_NOT_FOUND") {
			return Response.json(
				{ error: "Absence unit not found" },
				{ status: 404 },
			);
		}

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
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const unitId = params.unitId;
	if (!unitId) {
		return Response.json({ error: "Missing unitId" }, { status: 400 });
	}

	try {
		await prisma.absenceUnit.delete({ where: { id: unitId } });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return Response.json(
					{ error: "Absence unit not found" },
					{ status: 404 },
				);
			}

			if (error.code === "P2003") {
				return Response.json(
					{ error: "Cannot delete absence unit with related records" },
					{ status: 409 },
				);
			}
		}

		return Response.json(
			{ error: "Failed to delete absence unit" },
			{ status: 500 },
		);
	}
}
