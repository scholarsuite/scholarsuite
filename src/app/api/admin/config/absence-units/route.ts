import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";

function validatePeriodIds(periodIds: unknown): string[] {
	if (!Array.isArray(periodIds)) {
		return [];
	}

	const ids = periodIds.filter(
		(value): value is string => typeof value === "string",
	);

	if (ids.length !== periodIds.length) {
		throw new Error("All periodIds must be strings");
	}

	return Array.from(new Set(ids));
}

export async function POST(req: Request): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	let body: { label?: unknown; periodIds?: unknown };
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body.label !== "string" || body.label.trim().length === 0) {
		return Response.json({ error: "label is required" }, { status: 400 });
	}

	let periodIds: string[];
	try {
		periodIds = validatePeriodIds(body.periodIds);
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid periodIds" },
			{ status: 400 },
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const unit = await tx.absenceUnit.create({
			data: {
				label: body.label as string,
			},
		});

		if (periodIds.length > 0) {
			await tx.absenceUnitPeriod.createMany({
				data: periodIds.map((periodId) => ({ unitId: unit.id, periodId })),
			});
		}

		return {
			id: unit.id,
			label: unit.label,
			periodIds,
		};
	});

	return Response.json({ absenceUnit: result }, { status: 201 });
}
