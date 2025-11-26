import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { Input } from "./Input.tsx";

type Story = StoryObj<typeof Input>;
type Meta = MetaObj<typeof Input>;

export const Default: Story = {
	args: {
		placeholder: "you@example.com",
	},
};

export const WithDescription: Story = {
	args: {
		placeholder: "you@example.com",
		description: "Nous ne partagerons jamais votre adresse e‑mail.",
	},
};

export const Disabled: Story = {
	args: {
		placeholder: "disabled@example.com",
		disabled: true,
	},
};

export const DateInput: Story = {
	args: {
		type: "date",
	},
};

export const DateTimeInput: Story = {
	args: {
		type: "datetime-local",
	},
};

export const PasswordInput: Story = {
	args: {
		type: "password",
		placeholder: "Enter your password",
	},
};

export const checkbox: Story = {
	args: {
		type: "checkbox",
		checked: true,
	},
};

export default { component: Input } as Meta;
