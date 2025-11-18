import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";
import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";

export async function POST(
	req: Request,
	context: RouteContext<"/api/admin/users/[userId]/reset-password">,
): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const userId = params.userId;
	if (!userId) {
		return Response.json({ error: "Missing userId" }, { status: 400 });
	}

	let body: { password?: unknown };
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body.password !== "string" || body.password.length < 8) {
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
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		return Response.json(
			{ error: "Failed to reset password" },
			{ status: 500 },
		);
	}

	return Response.json({ ok: true });
}
