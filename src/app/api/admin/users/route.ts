import { hashPassword } from "better-auth/crypto";
import { getAuthorizedSystemAdmin, normalizeRoles } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";
import { isUniqueViolation, serializeUser } from "./lib.ts";

type ValidatedCreatePayload = {
	email: string;
	name: string;
	firstName: string | null;
	lastName: string | null;
	preferredLanguage: string | null;
	roles: ReturnType<typeof normalizeRoles>;
	password: string | null;
};

export async function GET(req: Request): Promise<Response> {
	const context = await getAuthorizedSystemAdmin(req.headers);
	if (context instanceof Response) {
		return context;
	}

	const users = await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
		include: { roles: true },
	});

	return Response.json({
		users: users.map((user) => serializeUser(user)),
	});
}

type CreateUserPayload = {
	email?: unknown;
	name?: unknown;
	firstName?: unknown;
	lastName?: unknown;
	preferredLanguage?: unknown;
	password?: unknown;
	roles?: unknown;
};

function validateCreatePayload(
	body: CreateUserPayload,
): ValidatedCreatePayload {
	const email =
		typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
	if (!email) {
		throw new Error("Email is required");
	}

	const name = typeof body.name === "string" ? body.name.trim() : null;
	if (!name) {
		throw new Error("Name is required");
	}

	const firstName =
		typeof body.firstName === "string" ? body.firstName.trim() : null;
	const lastName =
		typeof body.lastName === "string" ? body.lastName.trim() : null;
	const preferredLanguage =
		typeof body.preferredLanguage === "string"
			? body.preferredLanguage.trim()
			: null;

	const roles = normalizeRoles(body.roles);
	if (roles.length === 0) {
		throw new Error("At least one role is required");
	}

	const password =
		typeof body.password === "string" && body.password.length > 0
			? body.password
			: null;

	return {
		email,
		name,
		firstName,
		lastName,
		preferredLanguage,
		roles,
		password,
	};
}

export async function POST(req: Request): Promise<Response> {
	const context = await getAuthorizedSystemAdmin(req.headers);
	if (context instanceof Response) {
		return context;
	}

	let payload: CreateUserPayload;
	try {
		payload = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	let validated: ValidatedCreatePayload;
	try {
		validated = validateCreatePayload(payload);
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid payload" },
			{ status: 400 },
		);
	}

	try {
		const result = await prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					email: validated.email,
					name: validated.name,
					firstName: validated.firstName,
					lastName: validated.lastName,
					preferredLanguage: validated.preferredLanguage,
				},
				include: { roles: true },
			});

			if (validated.roles.length > 0) {
				await tx.userRole.createMany({
					data: validated.roles.map((role) => ({
						userId: user.id,
						role,
					})),
					skipDuplicates: true,
				});
			}

			let credentialPassword: string | null = null;
			if (validated.password) {
				credentialPassword = await hashPassword(validated.password);

				await tx.account.upsert({
					where: {
						id: `${user.id}-credential`,
					},
					update: {
						accountId: validated.email,
						providerId: "credential",
						userId: user.id,
						password: credentialPassword,
					},
					create: {
						id: `${user.id}-credential`,
						accountId: validated.email,
						providerId: "credential",
						userId: user.id,
						password: credentialPassword,
					},
				});
			}

			const freshUser = await tx.user.findUniqueOrThrow({
				where: { id: user.id },
				include: { roles: true },
			});

			return serializeUser(freshUser);
		});

		return Response.json({ user: result }, { status: 201 });
	} catch (error) {
		if (isUniqueViolation(error)) {
			return Response.json(
				{ error: "A user with this email already exists" },
				{ status: 409 },
			);
		}

		return Response.json({ error: "Failed to create user" }, { status: 500 });
	}
}
