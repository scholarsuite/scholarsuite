import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";

import { SettingsClient } from "./SettingsClient.tsx";

export default function AdminSettingsPage() {
	return (
		<AdminDashboardLayout
			title="Platform configuration"
			description="Control how the school platform behaves by adjusting domain settings, calendars, grading rules, and more."
		>
			<SettingsClient />
		</AdminDashboardLayout>
	);
}
