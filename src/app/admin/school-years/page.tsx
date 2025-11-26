import { getTranslations } from "next-intl/server";
import { SchoolYearsClient } from "#components/admin/school-years/SchoolYearsClient.tsx";
import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";

export default async function AdminSettingsPage() {
	const t = await getTranslations("app.admin");

	return (
		<AdminDashboardLayout
			backLinkLabel={t("backToAdminDashboard")}
			title={t("sections.schoolYears.title")}
			description={t("sections.schoolYears.description")}
		>
			<SchoolYearsClient />
		</AdminDashboardLayout>
	);
}
