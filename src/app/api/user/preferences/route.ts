import { auth } from "#lib/auth.ts";
import { PrismaClient } from "#prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
	try {
		const body = await req.json();
		const preferredLanguage = body.preferredLanguage;

		const session = await auth.api.getSession({ headers: req.headers as any });
		if (!session) return new Response("Unauthorized", { status: 401 });

		await prisma.user.update({
			where: { id: session.user.id },
			data: { preferredLanguage },
		});

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		return new Response(String(err), { status: 400 });
	}
}
