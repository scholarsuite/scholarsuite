import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";
import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";

export async function POST(
	req: Request,
	context: RouteContext<"/api/admin/users/[userId]/reset-password">,
): Promise<Response> {
	const logger = createApiLogger("api:admin/users/reset-password#POST");
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	const params = await context.params;
	const userId = params.userId;
	if (!userId) {
		await scopedLogger.warn("Missing userId parameter");
		return Response.json({ error: "Missing userId" }, { status: 400 });
	}

	let body: { password?: unknown };
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received", { userId });
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body.password !== "string" || body.password.length < 8) {
		await scopedLogger.warn("Password does not meet requirements", { userId });
		return Response.json(
			{ error: "Password must be at least 8 characters" },
			{ status: 400 },
		);
	}

	try {
		await prisma.$transaction(async (tx) => {
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { id: true, email: true },
			});

			if (!user) {
				throw new Error("USER_NOT_FOUND");
			}

			const hashedPassword = await hashPassword(body.password as string);

			const credentialAccount = await tx.account.findFirst({
				where: {
					userId: user.id,
					providerId: "credential",
				},
			});

			if (credentialAccount) {
				await tx.account.update({
					where: { id: credentialAccount.id },
					data: {
						password: hashedPassword,
						accountId: user.email,
					},
				});
				return;
			}

			await tx.account.create({
				data: {
					id: randomUUID(),
					accountId: user.email,
					providerId: "credential",
					userId: user.id,
					password: hashedPassword,
				},
			});
		});
	} catch (error) {
		if (error instanceof Error && error.message === "USER_NOT_FOUND") {
			await scopedLogger.warn("User not found during password reset", {
				userId,
			});
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		await scopedLogger.error("Failed to reset user password", {
			userId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to reset password" },
			{ status: 500 },
		);
	}

	await scopedLogger.info("Reset user password", { userId });

	return Response.json({ ok: true });
}
