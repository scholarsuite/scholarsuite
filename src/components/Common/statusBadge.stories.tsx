import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";

type Story = StoryObj<typeof StatusBadge>;
type Meta = MetaObj<typeof StatusBadge>;

export const Success: Story = {
	args: {
		children: "Active",
		variant: "success",
	},
};

export const Warning: Story = {
	args: {
		children: "Archived",
		variant: "warning",
	},
};

export const Info: Story = {
	args: {
		children: "Info",
		variant: "info",
	},
};

export const Danger: Story = {
	args: {
		children: "Error",
		variant: "danger",
	},
};

export const Neutral: Story = {
	args: {
		children: "Tag",
		variant: "neutral",
	},
};

export default { component: StatusBadge } as Meta;
