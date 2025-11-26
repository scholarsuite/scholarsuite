import classnames from "classnames";
import type { ComponentProps, FC } from "react";

type ButtonProps = ComponentProps<"button"> & {
	variant?: "neutral" | "outline" | "success" | "danger";
	size?: "small" | "medium" | "large";
};

export const Button: FC<ButtonProps> = ({
	children,
	variant = "neutral",
	size = "medium",
	...props
}) => (
	<button
		{...props}
		className={classnames(
			props.className,
			"group relative inline-flex items-center justify-center gap-3 h-fit w-fit mt-2 rounded-xl transition duration-200 ease-out overflow-hidden shadow-sm hover:scale-[1.02] active:scale-95 backdrop-blur-md",
			{
				// Variant styles
				"bg-white/30 dark:bg-white/10": !variant || variant === "neutral",
				"bg-transparent": variant === "outline",
				"bg-green-200/40 dark:bg-green-600/20": variant === "success",
				"bg-red-200/40 dark:bg-red-600/20": variant === "danger",
				"border border-slate-200 text-slate-900 hover:bg-white/40 dark:border-white/20 dark:text-white":
					!variant || variant === "neutral",
				"border border-slate-300 text-slate-900 hover:bg-white/20 dark:border-white/30 dark:text-white ":
					variant === "outline",
				"border border-green-400 text-green-900 hover:bg-green-300/40 dark:border-green-600 dark:text-white dark:hover:bg-green-700/20":
					variant === "success",
				"border border-red-400 text-red-900 hover:bg-red-300/40 dark:border-red-600 dark:text-white dark:hover:bg-red-700/20":
					variant === "danger",
				// Size styles
				"px-4 py-2 text-sm": size === "small",
				"px-6 py-3 text-base": size === "medium",
				"px-8 py-4 text-lg": size === "large",
			},
		)}
	>
		{children}
		<span
			className={classnames(
				"absolute inset-0 pointer-events-none rounded-xl border",
				{
					"border-slate-200 dark:border-white/10":
						!variant || variant === "neutral",
					"border-slate-300 dark:border-white/30": variant === "outline",
					"border-green-400 dark:border-green-600": variant === "success",
					"border-red-400 dark:border-red-600": variant === "danger",
				},
			)}
		/>
		<span
			className={classnames(
				"absolute -left-10 -top-6 w-36 h-40 bg-linear-to-br opacity-30 transform -rotate-12 blur-xl transition-transform duration-500 ease-out group-hover:translate-x-10 group-hover:scale-110 group-active:translate-x-6",
				{
					"from-white/30 via-white/10 to-transparent dark:from-white/40 dark:via-white/10 dark:to-transparent":
						!variant || variant === "neutral" || variant === "outline",
					"from-green-200/40 via-green-100/20 to-transparent dark:from-green-600/40 dark:via-green-600/10 dark:to-transparent":
						variant === "success",
					"from-red-200/40 via-red-100/20 to-transparent dark:from-red-600/40 dark:via-red-600/10 dark:to-transparent":
						variant === "danger",
				},
			)}
		/>
	</button>
);
