import { auth } from "#lib/auth.ts";
import { PrismaClient } from "#prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request): Promise<Response> {
	try {
		const session = await auth.api.getSession({ headers: req.headers });
		if (!session) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const preferredLanguage = body.preferredLanguage;

		if (typeof preferredLanguage !== "string") {
			return Response.json(
				{ error: "Invalid preferredLanguage" },
				{ status: 400 },
			);
		}

		const existingUser = await prisma.user.findUnique({
			where: { id: session.user.id },
		});

		if (!existingUser) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		await prisma.user.update({
			where: { id: session.user.id },
			data: { preferredLanguage },
		});

		return Response.json({ ok: true }, { status: 200 });
	} catch {
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
