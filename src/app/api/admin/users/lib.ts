import type { Prisma } from "#prisma/client";

type UserWithRoles = Prisma.UserGetPayload<{ include: { roles: true } }>;

type UserResponse = {
	id: string;
	email: string;
	name: string;
	firstName: string | null;
	lastName: string | null;
	preferredLanguage: string | null;
	archived: boolean;
	roles: string[];
	createdAt: string;
	updatedAt: string;
};

export function serializeUser(user: UserWithRoles): UserResponse {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		firstName: user.firstName ?? null,
		lastName: user.lastName ?? null,
		preferredLanguage: user.preferredLanguage ?? null,
		archived: user.archived,
		roles: user.roles.map((role) => role.role),
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
	};
}

export function isUniqueViolation(error: unknown): boolean {
	if (!error || typeof error !== "object") {
		return false;
	}

	return (
		"code" in error &&
		typeof (error as Prisma.PrismaClientKnownRequestError).code === "string" &&
		(error as Prisma.PrismaClientKnownRequestError).code === "P2002"
	);
}
