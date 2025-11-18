import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";
import { USER_ROLE } from "#prisma/client";

import { UsersClient } from "./UsersClient.tsx";

const ROLE_OPTIONS = Object.values(USER_ROLE).filter(
	(role) => role !== USER_ROLE.STUDENT,
);

export default async function AdminUsersPage() {
	const t = await getTranslations("app.admin");

	return (
		<AdminDashboardLayout
			backLinkLabel={t("backToAdminDashboard")}
			title={t("sections.users.title")}
			description={t("sections.users.description")}
		>
			<Suspense
				fallback={
					<p className="text-sm text-slate-600 dark:text-slate-300">
						{t("users.loadingUsers")}
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
