export function Tag({
	children,
	variant = "neutral",
	appearance = "solid",
	size = "md",
	mono = false,
	className = "",
}: {
	children: React.ReactNode;
	variant?: Variant;
	appearance?: Appearance;
	size?: Size;
	mono?: boolean;
	className?: string;
}) {
	return (
		<span
			className={`rounded-full ${sizeClasses[size]} ${appearanceClasses[appearance][variant]} ${mono ? "font-mono" : ""} ${className}`}
		>
			{children}
		</span>
	);
}

type Variant = "neutral" | "info" | "warning" | "success" | "danger";
type Appearance = "solid" | "outline";
type Size = "sm" | "md";

const sizeClasses: Record<Size, string> = {
	sm: "px-1.5 py-0 text-[11px]",
	md: "px-2 py-0.5 text-xs",
};

const appearanceClasses: Record<Appearance, Record<Variant, string>> = {
	solid: {
		neutral: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
		info: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
		warning:
			"bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
		success:
			"bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
		danger: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
	},
	outline: {
		neutral:
			"border border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-200",
		info: "border border-sky-300 text-sky-700 dark:border-sky-500/30 dark:text-sky-300",
		warning:
			"border border-amber-300 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
		success:
			"border border-emerald-300 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300",
		danger:
			"border border-rose-300 text-rose-700 dark:border-rose-500/30 dark:text-rose-300",
	},
};
