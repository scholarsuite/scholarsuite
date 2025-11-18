import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import type { ReactNode } from "react";

export type AdminDashboardLayoutProps = {
	title: string;
	description?: string;
	actions?: ReactNode;
	children: ReactNode;
};

export function AdminDashboardLayout({
	title,
	description,
	actions,
	children,
}: AdminDashboardLayoutProps) {
	return (
		<div className="mx-auto max-w-6xl space-y-8 p-6">
			<nav className="text-sm">
				<Link
					href={{ pathname: "/admin" }}
					className="inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
				>
					<ArrowLeftIcon className="size-4" />
					<span>Back to admin dashboard</span>
				</Link>
			</nav>

			<header className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
						{title}
					</h1>
					{description ? (
						<p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
							{description}
						</p>
					) : null}
				</div>
				{actions ? (
					<div className="flex items-center gap-2">{actions}</div>
				) : null}
			</header>

			<section className="space-y-8">{children}</section>
		</div>
	);
}
