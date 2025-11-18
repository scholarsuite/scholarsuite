import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";
import { Prisma } from "#prisma/client";

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/subject-categories/[categoryId]">,
): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const categoryId = params.categoryId;
	if (!categoryId) {
		return Response.json({ error: "Missing categoryId" }, { status: 400 });
	}

	let body: { label?: unknown; order?: unknown };
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const data: { label?: string; order?: number } = {};

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
		const category = await prisma.subjectCategory.update({
			where: { id: categoryId },
			data,
		});

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
			return Response.json(
				{ error: "Subject category not found" },
				{ status: 404 },
			);
		}

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
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const categoryId = params.categoryId;
	if (!categoryId) {
		return Response.json({ error: "Missing categoryId" }, { status: 400 });
	}

	try {
		await prisma.subjectCategory.delete({ where: { id: categoryId } });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return Response.json(
					{ error: "Subject category not found" },
					{ status: 404 },
				);
			}

			if (error.code === "P2003") {
				return Response.json(
					{ error: "Cannot delete subject category with related subjects" },
					{ status: 409 },
				);
			}
		}

		return Response.json(
			{ error: "Failed to delete subject category" },
			{ status: 500 },
		);
	}
}
