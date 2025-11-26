import { ArrowDownIcon } from "@heroicons/react/24/solid";
import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { Button } from "./Button";

type Story = StoryObj<typeof Button>;
type Meta = MetaObj<typeof Button>;

export const Default: Story = {
	args: {
		children: "Button Link",
	},
};

export const WithIcon: Story = {
	args: {
		children: (
			<>
				Button Link <ArrowDownIcon className="size-6" />
			</>
		),
	},
};

export const Disabled: Story = {
	args: {
		children: "Button Link",
		disabled: true,
	},
};

export const Outline: Story = {
	args: {
		children: "Button Link",
		variant: "outline",
	},
};

export const Success: Story = {
	args: {
		children: "Button Link",
		variant: "success",
	},
};

export const Danger: Story = {
	args: {
		children: "Button Link",
		variant: "danger",
	},
};

export default { component: Button } as Meta;
