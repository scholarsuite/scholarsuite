"use client";
import classNames from "classnames";
import type React from "react";
import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	description?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className = "", description, type, ...props }, ref) => (
		<div className={classNames("w-full", { "space-y-1": description })}>
			<input
				type={type}
				ref={ref}
				{...props}
				className={classNames(
					type === "checkbox"
						? "size-4 appearance-none rounded-sm border border-gray-300 bg-gray-100 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-indigo-600"
						: "w-full px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 bg-white/20 dark:bg-white/6 border border-white/10 dark:border-white/10 backdrop-blur-md shadow-sm dark:text-slate-200",
					className,
				)}
			/>

			{description && type !== "checkbox" && (
				<p className="text-xs text-slate-500 dark:text-white/70 mt-1">
					{description}
				</p>
			)}
		</div>
	),
);
