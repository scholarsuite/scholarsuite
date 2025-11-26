import classNames from "classnames";
import type { FC, PropsWithChildren } from "react";

export type InfoBoxVariant =
	| "info"
	| "warning"
	| "error"
	| "success"
	| "neutral";

export const InfoBox: FC<
	PropsWithChildren<{
		variant?: InfoBoxVariant;
		className?: string;
	}>
> = ({ children, variant = "info", className = "" }) => (
	<div
		className={classNames(
			"relative rounded-2xl border p-4 text-sm overflow-hidden",
			{
				"border-sky-200 bg-sky-50/80 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200":
					variant === "info",
				"border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200":
					variant === "warning",
				"border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200":
					variant === "error",
				"border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200":
					variant === "success",
				"border-slate-200/80 bg-white/90 text-slate-700 dark:border-white/10 dark:bg-white/4 dark:text-slate-200":
					variant === "neutral",
			},
			className,
		)}
	>
		<span
			className={classNames(
				"absolute inset-0 pointer-events-none rounded-xl border",
				{
					"border-sky-200 dark:border-sky-500/30": variant === "info",
					"border-amber-200 dark:border-amber-500/30": variant === "warning",
					"border-rose-200 dark:border-rose-500/30": variant === "error",
					"border-emerald-200 dark:border-emerald-500/30":
						variant === "success",
					"border-slate-200 dark:border-white/10": variant === "neutral",
				},
			)}
		/>
		<span
			className={classNames(
				"absolute -left-8 -top-8 w-56 h-56 opacity-30 scale-110 blur-2xl transition-transform duration-500 ease-out group-hover:translate-x-10 group-hover:scale-125 group-active:translate-x-6 rounded-xl z-0",
				{
					"bg-linear-to-br from-sky-400/40 via-sky-300/30 to-transparent dark:from-sky-200/60 dark:via-sky-200/30 dark:to-transparent":
						variant === "info",
					"bg-linear-to-br from-amber-400/40 via-amber-300/30 to-transparent dark:from-amber-200/60 dark:via-amber-200/30 dark:to-transparent":
						variant === "warning",
					"bg-linear-to-br from-rose-400/40 via-rose-300/30 to-transparent dark:from-rose-200/60 dark:via-rose-200/30 dark:to-transparent":
						variant === "error",
					"bg-linear-to-br from-emerald-400/40 via-emerald-300/30 to-transparent dark:from-emerald-200/60 dark:via-emerald-200/30 dark:to-transparent":
						variant === "success",
					"bg-linear-to-br from-slate-400/40 via-slate-300/30 to-transparent dark:from-white/60 dark:via-white/30 dark:to-transparent":
						variant === "neutral",
				},
			)}
		/>
		<span className="relative z-10">{children}</span>
	</div>
);
