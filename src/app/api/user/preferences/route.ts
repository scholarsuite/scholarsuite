import { auth } from "#lib/auth.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";

const ROUTE_SCOPE = "api:user/preferences";

export async function PATCH(req: Request): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#PATCH`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	try {
		const session = await auth.api.getSession({ headers: req.headers });
		if (!session) {
			await logger.warn("Unauthorized preferences update attempt");
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const scopedLogger = logger.with({ userId: session.user.id });

		let body: { preferredLanguage?: unknown };
		try {
			body = await req.json();
		} catch {
			await scopedLogger.warn("Invalid JSON payload received");
			return Response.json({ error: "Invalid JSON" }, { status: 400 });
		}

		const preferredLanguage = body.preferredLanguage;

		if (typeof preferredLanguage !== "string") {
			await scopedLogger.warn("Invalid preferredLanguage value", {
				type: typeof preferredLanguage,
			});
			return Response.json(
				{ error: "Invalid preferredLanguage" },
				{ status: 400 },
			);
		}

		const existingUser = await prisma.user.findUnique({
			where: { id: session.user.id },
		});

		if (!existingUser) {
			await scopedLogger.warn("User not found while updating preferences");
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		await prisma.user.update({
			where: { id: session.user.id },
			data: { preferredLanguage },
		});

		await scopedLogger.info("Updated preferred language", {
			preferredLanguage,
		});

		return Response.json({ ok: true }, { status: 200 });
	} catch (error) {
		await logger.error("Failed to update user preferences", {
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
