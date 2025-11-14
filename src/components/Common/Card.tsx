"use client";
import type React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
	glass?: boolean;
	innerClassName?: string;
};

const Card: React.FC<CardProps> = ({
	children,
	className = "",
	innerClassName = "",
	glass = true,
	...rest
}) => {
	const glassClasses = glass
		? "bg-white/6 dark:bg-white/6 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-2xl"
		: "bg-white dark:bg-slate-900";

	return (
		<div
			{...rest}
			className={`relative rounded-3xl overflow-hidden ${glassClasses} ${className}`}
		>
			<div className="absolute inset-0 pointer-events-none rounded-3xl bg-linear-to-br from-white/6 via-white/3 to-transparent opacity-30 blur-sm mix-blend-overlay" />

			<div className={`relative z-10 ${innerClassName}`}>{children}</div>
		</div>
	);
};

export { Card };
export default Card;
