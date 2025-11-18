import { auth } from "#lib/auth.ts";
import { prisma } from "#lib/prisma.ts";
import type { User, UserRole } from "#prisma/client";
import { USER_ROLE } from "#prisma/client";

export type AuthorizedAdminContext = {
	session: Awaited<ReturnType<typeof auth.api.getSession>> extends infer S
		? S
		: never;
	user: User & { roles: UserRole[] };
};

function hasSystemAdminRole(roles: UserRole[]): boolean {
	return roles.some((role) => role.role === USER_ROLE.SYSTEM_ADMIN);
}

export async function getAuthorizedSystemAdmin(
	headers: Headers,
): Promise<AuthorizedAdminContext | Response> {
	const session = await auth.api.getSession({ headers });
	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: { roles: true },
	});

	if (!user) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	if (!hasSystemAdminRole(user.roles)) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	return { session, user };
}

export function assertValidRoleCombination(roles: USER_ROLE[]): void {
	if (roles.includes(USER_ROLE.STUDENT) && roles.length > 1) {
		throw new Error("STUDENT role cannot be combined with other roles");
	}
}

export function normalizeRoles(roles: unknown): USER_ROLE[] {
	if (!Array.isArray(roles)) {
		return [];
	}

	const parsedRoles = roles
		.map((role) => {
			if (typeof role !== "string") {
				return null;
			}
			const upper = role.toUpperCase();
			return USER_ROLE[upper as keyof typeof USER_ROLE] ?? null;
		})
		.filter((role): role is USER_ROLE => role !== null);

	assertValidRoleCombination(parsedRoles);

	return Array.from(new Set(parsedRoles));
}
