"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import * as SelectPrimitive from "@radix-ui/react-select";
import classNames from "classnames";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useId, useMemo, useState } from "react";

export type SelectValue<T extends string> = {
	label: string;
	value: T;
	iconImage?: ReactElement<SVGSVGElement>;
	disabled?: boolean;
};

export type SelectGroup<T extends string> = {
	label?: string;
	items: Array<SelectValue<T>>;
};

export type SelectProps<T extends string> = {
	values: Array<SelectGroup<T>> | Array<T> | Array<SelectValue<T>>;
	defaultValue?: T;
	placeholder?: string;
	label?: string;
	inline?: boolean;
	onChange?: (value: T) => void;
	className?: string;
	/**
	 * Allows passing custom CSS classes to the dropdown container element.
	 * This is useful for overriding default styles, such as adjusting `max-height`.
	 * The dropdown is rendered within a `Portal`.
	 */
	dropdownClassName?: string;
	ariaLabel?: string;
	disabled?: boolean;
	fallbackClass?: string;
	as?: "div";
};

const isStringArray = <T extends string>(
	values: Array<SelectGroup<T>> | Array<T> | Array<SelectValue<T>>,
): values is Array<T> => {
	return values.length > 0 && typeof values[0] === "string";
};

const isValuesArray = <T extends string>(
	values: Array<SelectGroup<T>> | Array<T> | Array<SelectValue<T>>,
): values is Array<SelectValue<T>> => {
	return (
		values.length > 0 &&
		typeof values[0] === "object" &&
		"label" in values[0] &&
		"value" in values[0]
	);
};

export const Select = <T extends string>({
	values = [],
	defaultValue,
	placeholder,
	label,
	inline,
	onChange,
	className,
	dropdownClassName,
	ariaLabel,
	disabled = false,
	fallbackClass = "",
}: SelectProps<T>): ReactNode => {
	const id = useId();
	const [value, setValue] = useState(defaultValue);

	useEffect(() => setValue(defaultValue), [defaultValue]);

	const mappedValues = useMemo(() => {
		let mappedValues = values;

		if (isStringArray(mappedValues)) {
			mappedValues = mappedValues.map((value) => ({
				label: value,
				value,
			}));
		}

		if (isValuesArray(mappedValues)) {
			return [{ items: mappedValues }];
		}

		return mappedValues;
	}, [values]) as Array<SelectGroup<T>>;

	// We render the actual item slotted to fix/prevent the issue
	// of the tirgger flashing on the initial render
	const currentItem = useMemo(
		() =>
			mappedValues
				.flatMap(({ items }) => items)
				.find((item) => item.value === value),
		[mappedValues, value],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: read the end of this useMemo
	const memoizedMappedValues = useMemo(() => {
		return mappedValues.map(({ label, items }, key) => (
			<SelectPrimitive.Group key={label?.toString() ?? key}>
				{label && (
					<SelectPrimitive.Label
						className={classNames(
							"px-3 py-1 text-xs text-slate-500 dark:text-white/70",
						)}
					>
						{label}
					</SelectPrimitive.Label>
				)}

				{items.map(({ value, label, iconImage, disabled }) => (
					<SelectPrimitive.Item
						key={value}
						value={value}
						disabled={disabled}
						className={classNames(
							"flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-white/90 cursor-pointer",
							"rounded-md select-none",
							"data-disabled:opacity-50 data-disabled:pointer-events-none",
							"focus:outline-none focus:bg-indigo-50 dark:focus:bg-white/6",
						)}
					>
						<SelectPrimitive.ItemText className="flex items-center gap-2">
							{iconImage}
							<span>{label}</span>
						</SelectPrimitive.ItemText>
					</SelectPrimitive.Item>
				))}
			</SelectPrimitive.Group>
		));
		// We explicitly want to recalculate these values only when the values themselves changed
		// This is to prevent re-rendering and re-calcukating the values on every render
	}, [JSON.stringify(values)]);

	// Both change the internal state and emit the change event
	const handleChange = (value: T) => {
		setValue(value);

		if (typeof onChange === "function") {
			onChange(value);
		}
	};

	return (
		<span
			className={classNames(
				"inline-block",
				{ "items-center": inline },
				className,
				fallbackClass,
			)}
		>
			{label && (
				<label
					className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2"
					htmlFor={id}
				>
					{label}
				</label>
			)}

			<SelectPrimitive.Root
				value={currentItem !== undefined ? value : undefined}
				onValueChange={handleChange}
				disabled={disabled}
			>
				<SelectPrimitive.Trigger
					className={classNames(
						"w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl",
						"text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:text-white/80",
						"bg-white/20 dark:bg-white/6 border border-white/10 dark:border-white/10 backdrop-blur-md shadow-sm",
					)}
					aria-label={ariaLabel}
					id={id}
				>
					<SelectPrimitive.Value placeholder={placeholder}>
						{currentItem !== undefined && (
							<>
								{currentItem.iconImage}
								<span>{currentItem.label}</span>
							</>
						)}
					</SelectPrimitive.Value>
					<ChevronDownIcon className="h-4 w-4 text-slate-500 dark:text-white/60" />
				</SelectPrimitive.Trigger>

				<SelectPrimitive.Portal>
					<SelectPrimitive.Content
						position={inline ? "popper" : "item-aligned"}
						className={classNames(
							"z-50 rounded-2xl bg-white/98 dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden",
							"max-h-64 w-64",
							{ "origin-top-right": !inline },
							dropdownClassName,
						)}
					>
						<SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-8">
							<ChevronUpIcon className="h-4 w-4 text-slate-400" />
						</SelectPrimitive.ScrollUpButton>
						<SelectPrimitive.Viewport>
							{memoizedMappedValues}
						</SelectPrimitive.Viewport>
						<SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-8">
							<ChevronDownIcon className="h-4 w-4 text-slate-400" />
						</SelectPrimitive.ScrollDownButton>
					</SelectPrimitive.Content>
				</SelectPrimitive.Portal>
			</SelectPrimitive.Root>
		</span>
	);
};
