import type { FC } from "react";

import { AdminDashboardLayout } from "#components/Layout/AdminDashboard.tsx";

const AdminLogsPage: FC = () => {
	return (
		<AdminDashboardLayout
			title="System logs"
			description="Audit platform activity to troubleshoot issues and maintain compliance."
		>
			<p className="text-sm text-slate-600 dark:text-slate-300">
				Log streaming is not implemented yet.
			</p>
		</AdminDashboardLayout>
	);
};

export default AdminLogsPage;
