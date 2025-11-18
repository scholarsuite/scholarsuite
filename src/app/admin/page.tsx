import Link from "next/link";

type AdminRoute = `/admin/${string}`;

const ADMIN_SECTIONS: Array<{
	href: AdminRoute;
	title: string;
	description: string;
}> = [
	{
		href: "/admin/users",
		title: "Users",
		description:
			"Invite, edit, and archive internal accounts with the right roles.",
	},
	{
		href: "/admin/settings",
		title: "Configuration",
		description:
			"Tune global school settings, levels, subjects, and reporting units.",
	},
	{
		href: "/admin/logs",
		title: "Logs",
		description:
			"Review system events to monitor activity and troubleshoot issues.",
	},
	{
		href: "/admin/school-years",
		title: "School Years",
		description:
			"Define academic cycles, their periods, and associated levels.",
	},
	{
		href: "/admin/classes",
		title: "Classes",
		description: "Manage class groups, educators, and student assignments.",
	},
	{
		href: "/admin/students",
		title: "Students",
		description:
			"Review student profiles, contacts, and year placement records.",
	},
	{
		href: "/admin/attendance",
		title: "Attendance",
		description: "Track and adjust attendance logs across course periods.",
	},
	{
		href: "/admin/evaluations",
		title: "Evaluations",
		description: "Configure evaluation periods and manage grade inputs.",
	},
	{
		href: "/admin/reports",
		title: "Reports",
		description: "Generate and publish report cards and progress bulletins.",
	},
	{
		href: "/admin/disciplinary-reports",
		title: "Disciplinary",
		description: "Record behavioural incidents and follow up on actions.",
	},
];

export default function AdminPage() {
	return (
		<div className="mx-auto max-w-6xl space-y-10 p-6">
			<header className="space-y-3">
				<h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
					Administration
				</h1>
				<p className="text-sm text-slate-600 dark:text-slate-300">
					Access the tools required to operate the platform. Pick a module to
					review data, configure the school, or assist staff members.
				</p>
			</header>

			<section>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{ADMIN_SECTIONS.map((section) => (
						<Link
							key={section.href}
							href={{ pathname: section.href }}
							className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
						>
							<div className="space-y-3">
								<h2 className="text-lg font-medium text-slate-900 transition group-hover:text-slate-700 dark:text-white dark:group-hover:text-white/80">
									{section.title}
								</h2>
								<p className="text-sm text-slate-600 dark:text-slate-300">
									{section.description}
								</p>
							</div>
							<span className="mt-6 inline-flex items-center text-sm font-medium text-slate-700 transition group-hover:text-slate-900 dark:text-white/80 dark:group-hover:text-white">
								Open module
								<svg
									aria-hidden="true"
									className="ml-2 h-4 w-4"
									viewBox="0 0 16 16"
									fill="none"
								>
									<path
										d="M4.5 3.5L11 8L4.5 12.5"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
