import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";

export async function PUT(req: Request): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	let body: { schoolName?: unknown };
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (
		typeof body.schoolName !== "string" ||
		body.schoolName.trim().length === 0
	) {
		return Response.json({ error: "schoolName is required" }, { status: 400 });
	}

	const schoolName = body.schoolName.trim();

	const existing = await prisma.schoolSettings.findFirst();

	const result = existing
		? await prisma.schoolSettings.update({
				where: { id: existing.id },
				data: { schoolName },
			})
		: await prisma.schoolSettings.create({
				data: { schoolName },
			});

	return Response.json({
		schoolSettings: {
			id: result.id,
			schoolName: result.schoolName,
		},
	});
}
