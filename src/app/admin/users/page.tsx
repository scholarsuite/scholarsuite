import { Suspense } from "react";

import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";
import { USER_ROLE } from "#prisma/client";

import { UsersClient } from "./UsersClient.tsx";

const ROLE_OPTIONS = Object.values(USER_ROLE).filter(
	(role) => role !== USER_ROLE.STUDENT,
);

export default function AdminUsersPage() {
	return (
		<AdminDashboardLayout
			title="User management"
			description="Create, edit, and support the internal users that operate the school platform."
		>
			<Suspense
				fallback={
					<p className="text-sm text-slate-600 dark:text-slate-300">
						Loading users...
					</p>
				}
			>
				<UsersClient
					roleOptions={ROLE_OPTIONS}
					defaultRole={USER_ROLE.TEACHER}
				/>
			</Suspense>
		</AdminDashboardLayout>
	);
}
