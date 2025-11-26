import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { InfoBox } from "./InfoBox.tsx";

type Story = StoryObj<typeof InfoBox>;
type Meta = MetaObj<typeof InfoBox>;

export const Info: Story = {
	args: {
		variant: "info",
		children: "This is an info message.",
	},
};

export const Warning: Story = {
	args: {
		variant: "warning",
		children: "This is a warning message.",
	},
};

export const ErrorBox: Story = {
	name: "Error",
	args: {
		variant: "error",
		children: "This is an error message.",
	},
};

export const Success: Story = {
	args: {
		variant: "success",
		children: "This is a success message.",
	},
};

export const Neutral: Story = {
	args: {
		variant: "neutral",
		children: "This is a neutral message.",
	},
};

export default { component: InfoBox } as Meta;
