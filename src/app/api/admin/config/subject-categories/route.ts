import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";

export async function POST(req: Request): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	let body: { label?: unknown; order?: unknown };
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body.label !== "string" || body.label.trim().length === 0) {
		return Response.json({ error: "label is required" }, { status: 400 });
	}

	if (typeof body.order !== "number" || !Number.isInteger(body.order)) {
		return Response.json(
			{ error: "order must be an integer" },
			{ status: 400 },
		);
	}

	const category = await prisma.subjectCategory.create({
		data: {
			label: body.label.trim(),
			order: body.order,
		},
	});

	return Response.json(
		{
			subjectCategory: {
				id: category.id,
				label: category.label,
				order: category.order,
			},
		},
		{ status: 201 },
	);
}
