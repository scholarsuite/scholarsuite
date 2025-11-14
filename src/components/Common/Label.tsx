// biome-ignore-all lint/a11y/noLabelWithoutControl: it's a ui component
"use client";
import classNames from "classnames";
import type { FC, LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
	srOnly?: boolean;
};

export const Label: FC<LabelProps> = ({
	children,
	className = "",
	srOnly = false,
	...rest
}) => (
	<label
		{...rest}
		className={classNames(
			{
				"sr-only": srOnly,
				"block text-sm font-medium mb-2 text-slate-700 dark:text-white/80":
					!srOnly,
			},
			className,
		)}
	>
		{children}
	</label>
);
