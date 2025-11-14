import classnames from "classnames";
import type { ComponentProps, FC } from "react";

export const Button: FC<ComponentProps<"button">> = ({
	children,
	...props
}) => (
	<button
		{...props}
		className={classnames(
			props.className,
			"group relative inline-flex items-center justify-center gap-3 w-fit px-6 py-3 mt-2 rounded-xl transition duration-200 ease-out overflow-hidden bg-slate-100 border border-slate-200 text-slate-900 shadow-sm hover:scale-[1.02] active:scale-95 hover:bg-slate-50 dark:bg-white/8 dark:border-white/20 dark:text-white dark:backdrop-blur-md dark:shadow-lg dark:hover:bg-white/12",
		)}
	>
		{children}
		<span className="absolute inset-0 pointer-events-none rounded-xl border border-slate-200 dark:border-white/10" />
		<span className="absolute -left-10 -top-6 w-36 h-40 bg-linear-to-br from-slate-700/20 via-slate-600/10 to-transparent opacity-30 transform -rotate-12 blur-xl transition-transform duration-500 ease-out group-hover:translate-x-10 group-hover:scale-110 group-active:translate-x-6 dark:from-white/40 dark:via-white/10 dark:to-transparent" />
	</button>
);
