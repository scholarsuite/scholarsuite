import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";
import { Prisma } from "#prisma/client";

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/levels/[levelId]">,
): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const levelId = params.levelId;
	if (!levelId) {
		return Response.json({ error: "Missing levelId" }, { status: 400 });
	}

	let body: { label?: unknown; order?: unknown };
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const data: Prisma.LevelUpdateInput = {};

	if (body.label !== undefined) {
		if (typeof body.label !== "string" || body.label.trim().length === 0) {
			return Response.json({ error: "Invalid label" }, { status: 400 });
		}
		data.label = body.label.trim();
	}

	if (body.order !== undefined) {
		if (typeof body.order !== "number" || !Number.isInteger(body.order)) {
			return Response.json({ error: "Invalid order" }, { status: 400 });
		}
		data.order = body.order;
	}

	if (Object.keys(data).length === 0) {
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	try {
		const level = await prisma.level.update({
			where: { id: levelId },
			data,
		});

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
			return Response.json({ error: "Level not found" }, { status: 404 });
		}

		return Response.json({ error: "Failed to update level" }, { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	context: RouteContext<"/api/admin/config/levels/[levelId]">,
): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const levelId = params.levelId;
	if (!levelId) {
		return Response.json({ error: "Missing levelId" }, { status: 400 });
	}

	try {
		await prisma.level.delete({ where: { id: levelId } });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return Response.json({ error: "Level not found" }, { status: 404 });
			}

			if (error.code === "P2003") {
				return Response.json(
					{ error: "Cannot delete level with related records" },
					{ status: 409 },
				);
			}
		}

		return Response.json({ error: "Failed to delete level" }, { status: 500 });
	}
}
