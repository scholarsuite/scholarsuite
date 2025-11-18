import classNames from "classnames";
import type { FC, HTMLAttributes } from "react";

export const Table: FC<HTMLAttributes<HTMLTableElement>> = ({
	className = "",
	...props
}) => (
	<table
		className={classNames(
			"min-w-full divide-y divide-slate-200 dark:divide-white/10",
			className,
		)}
		{...props}
	/>
);

export const Thead: FC<HTMLAttributes<HTMLTableSectionElement>> = ({
	className = "",
	...props
}) => (
	<thead
		className={classNames("bg-slate-50 dark:bg-white/5", className)}
		{...props}
	/>
);

export const Tbody: FC<HTMLAttributes<HTMLTableSectionElement>> = ({
	className = "",
	...props
}) => (
	<tbody
		className={classNames(
			"divide-y divide-slate-200 bg-white dark:divide-white/10 dark:bg-white/2",
			className,
		)}
		{...props}
	/>
);

export const Tr: FC<HTMLAttributes<HTMLTableRowElement>> = ({ ...props }) => (
	<tr {...props} />
);

export const Th: FC<HTMLAttributes<HTMLTableCellElement>> = ({
	className = "",
	...props
}) => (
	<th
		className={classNames(
			"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
			className,
		)}
		{...props}
	/>
);

export const Td: FC<HTMLAttributes<HTMLTableCellElement>> = ({
	className = "",
	...props
}) => (
	<td className={classNames("px-4 py-4 align-top", className)} {...props} />
);
