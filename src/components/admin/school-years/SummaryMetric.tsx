import type { FC } from "react";

type SummaryMetricProps = {
	title: string;
	value: string;
};

export const SummaryMetric: FC<SummaryMetricProps> = ({ title, value }) => {
	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/4">
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
				{title}
			</p>
			<p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
				{value}
			</p>
		</div>
	);
};
