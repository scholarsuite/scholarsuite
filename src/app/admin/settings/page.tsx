import { getTranslations } from "next-intl/server";

import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";

import { SettingsClient } from "./SettingsClient.tsx";

export default async function AdminSettingsPage() {
	const t = await getTranslations("app.admin");

	return (
		<AdminDashboardLayout
			backLinkLabel={t("backToAdminDashboard")}
			title={t("sections.settings.title")}
			description={t("sections.settings.description")}
		>
			<SettingsClient />
		</AdminDashboardLayout>
	);
}
