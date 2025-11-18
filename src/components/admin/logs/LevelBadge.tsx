import classNames from "classnames";
import type { FC } from "react";
import { LOG_LEVEL } from "#prisma/enums";

export const LevelBadge: FC<{ level: LOG_LEVEL }> = ({ level }) => (
	<span
		className={classNames(
			"inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-none",
			{
				"bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200":
					level === LOG_LEVEL.DEBUG,
				"bg-sky-100 text-sky-800 dark:bg-sky-400/20 dark:text-sky-200":
					level === LOG_LEVEL.INFO,
				"bg-amber-100 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200":
					level === LOG_LEVEL.WARN,
				"bg-rose-100 text-rose-900 dark:bg-rose-400/20 dark:text-rose-200":
					level === LOG_LEVEL.ERROR,
			},
		)}
	>
		{level}
	</span>
);
