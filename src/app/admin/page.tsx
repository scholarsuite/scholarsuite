"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

type AdminRoute = `/admin/${string}`;

const ADMIN_SECTIONS: Array<{
	href: AdminRoute;
	title: string;
	description: string;
}> = [
	{
		href: "/admin/users",
		title: "sections.users.title",
		description: "sections.users.description",
	},
	{
		href: "/admin/settings",
		title: "sections.settings.title",
		description: "sections.settings.description",
	},
	{
		href: "/admin/logs",
		title: "sections.logs.title",
		description: "sections.logs.description",
	},
	{
		href: "/admin/school-years",
		title: "sections.schoolYears.title",
		description: "sections.schoolYears.description",
	},
	{
		// not implemented yet
		href: "/admin/classes",
		title: "sections.classes.title",
		description: "sections.classes.description",
	},
	{
		// not implemented yet
		href: "/admin/students",
		title: "sections.students.title",
		description: "sections.students.description",
	},
	{
		// not implemented yet
		href: "/admin/attendance",
		title: "sections.attendance.title",
		description: "sections.attendance.description",
	},
	/*
	NOT MVP FEATURES
	{
		href: "/admin/evaluations",
		title: "sections.evaluations.title",
		description: "sections.evaluations.description",
	},
	{
		href: "/admin/reports",
		title: "sections.reports.title",
		description: "sections.reports.description",
	},
	{
		href: "/admin/disciplinary-reports",
		title: "sections.disciplinaryReports.title",
		description: "sections.disciplinaryReports.description",
	},
	*/
];

export default function AdminPage() {
	const t = useTranslations("app.admin");

	return (
		<div className="mx-auto max-w-6xl space-y-10 p-6">
			<header className="space-y-3">
				<h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
					{t("title")}
				</h1>
				<p className="text-sm text-slate-600 dark:text-slate-300">
					{t("description")}
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
									{t(section.title)}
								</h2>
								<p className="text-sm text-slate-600 dark:text-slate-300">
									{t(section.description)}
								</p>
							</div>
							<span className="mt-6 inline-flex items-center text-sm font-medium text-slate-700 transition group-hover:text-slate-900 dark:text-white/80 dark:group-hover:text-white">
								{t("openModule")}
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
