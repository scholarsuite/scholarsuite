import classNames from "classnames";
import type { FC, PropsWithChildren } from "react";

export type Variant = "success" | "warning" | "info" | "danger" | "neutral";

export const StatusBadge: FC<
	PropsWithChildren<{
		variant?: Variant;
		className?: string;
	}>
> = ({ children, variant = "neutral", className = "" }) => (
	<span
		className={classNames(
			"inline-flex rounded-full px-3 py-1 text-xs font-medium",
			{
				"bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300":
					variant === "success",
				"bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300":
					variant === "warning",
				"bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300":
					variant === "info",
				"bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300":
					variant === "danger",
				"bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200":
					variant === "neutral",
			},
			className,
		)}
	>
		{children}
	</span>
);
