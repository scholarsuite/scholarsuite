import { getAuthorizedSystemAdmin, normalizeRoles } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";
import type { Prisma } from "#prisma/client";
import { isUniqueViolation, serializeUser } from "../lib.ts";

type UpdateUserPayload = {
	email?: unknown;
	name?: unknown;
	firstName?: unknown;
	lastName?: unknown;
	preferredLanguage?: unknown;
	roles?: unknown;
	archived?: unknown;
};

type ValidatedUpdatePayload = {
	userData: Prisma.UserUpdateInput;
	roles?: ReturnType<typeof normalizeRoles>;
};

function validateUpdatePayload(
	body: UpdateUserPayload,
): ValidatedUpdatePayload {
	const userData: Prisma.UserUpdateInput = {};

	if (body.email !== undefined) {
		if (typeof body.email !== "string" || body.email.trim().length === 0) {
			throw new Error("Invalid email");
		}
		userData.email = body.email.trim().toLowerCase();
	}

	if (body.name !== undefined) {
		if (typeof body.name !== "string" || body.name.trim().length === 0) {
			throw new Error("Invalid name");
		}
		userData.name = body.name.trim();
	}

	if (body.firstName !== undefined) {
		if (body.firstName !== null && typeof body.firstName !== "string") {
			throw new Error("Invalid firstName");
		}
		userData.firstName =
			typeof body.firstName === "string" ? body.firstName.trim() : null;
	}

	if (body.lastName !== undefined) {
		if (body.lastName !== null && typeof body.lastName !== "string") {
			throw new Error("Invalid lastName");
		}
		userData.lastName =
			typeof body.lastName === "string" ? body.lastName.trim() : null;
	}

	if (body.preferredLanguage !== undefined) {
		if (
			body.preferredLanguage !== null &&
			typeof body.preferredLanguage !== "string"
		) {
			throw new Error("Invalid preferredLanguage");
		}
		userData.preferredLanguage =
			typeof body.preferredLanguage === "string"
				? body.preferredLanguage.trim()
				: null;
	}

	if (body.archived !== undefined) {
		if (typeof body.archived !== "boolean") {
			throw new Error("Invalid archived flag");
		}
		userData.archived = body.archived;
	}

	let roles: ReturnType<typeof normalizeRoles> | undefined;
	if (body.roles !== undefined) {
		if (!Array.isArray(body.roles)) {
			throw new Error("Roles must be an array");
		}
		roles = normalizeRoles(body.roles);
	}

	return { userData, roles };
}

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/users/[userId]">,
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

	let payload: UpdateUserPayload;
	try {
		payload = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	let validated: ValidatedUpdatePayload;
	try {
		validated = validateUpdatePayload(payload);
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid payload" },
			{ status: 400 },
		);
	}

	try {
		const updatedUser = await prisma.$transaction(async (tx) => {
			const userExists = await tx.user.findUnique({
				where: { id: userId },
				select: { id: true },
			});

			if (!userExists) {
				return null;
			}

			await tx.user.update({
				where: { id: userId },
				data: validated.userData,
			});

			if (validated.roles !== undefined) {
				await tx.userRole.deleteMany({ where: { userId } });

				if (validated.roles.length > 0) {
					await tx.userRole.createMany({
						data: validated.roles.map((role) => ({ userId, role })),
					});
				}
			}

			return tx.user.findUnique({
				where: { id: userId },
				include: { roles: true },
			});
		});

		if (!updatedUser) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		return Response.json({ user: serializeUser(updatedUser) });
	} catch (error) {
		if (isUniqueViolation(error)) {
			return Response.json(
				{ error: "A user with this email already exists" },
				{ status: 409 },
			);
		}

		return Response.json({ error: "Failed to update user" }, { status: 500 });
	}
}
