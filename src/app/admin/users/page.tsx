import { getTranslations } from "next-intl/server";

import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";
import { USER_ROLE } from "#prisma/enums";

import { UsersClient } from "./UsersClient.tsx";

export default async function AdminUsersPage() {
	const t = await getTranslations("app.admin");

	return (
		<AdminDashboardLayout
			backLinkLabel={t("backToAdminDashboard")}
			title={t("sections.users.title")}
			description={t("sections.users.description")}
		>
			<UsersClient defaultRole={USER_ROLE.TEACHER} />
		</AdminDashboardLayout>
	);
}
