import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { Select } from "./Select.tsx";

const opts = [
	{ value: "", label: "Please select", disabled: true },
	{ value: "math", label: "Mathematics" },
	{ value: "fr", label: "French" },
	{ value: "eng", label: "English" },
];

type Story = StoryObj<typeof Select>;
type Meta = MetaObj<typeof Select>;

export const Default: Story = {
	args: {
		values: opts.slice(1),
		defaultValue: "eng",
		placeholder: "Choose a subject",
	},
};

export const Disabled: Story = {
	args: {
		values: opts.slice(1),
		defaultValue: "eng",
		disabled: true,
	},
};

export default { component: Select } as Meta;
