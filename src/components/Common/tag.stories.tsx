import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
	component: Tag,
	argTypes: {
		variant: {
			control: { type: "select" },
			options: ["neutral", "info", "warning", "success", "danger"],
		},
		appearance: {
			control: { type: "select" },
			options: ["solid", "outline"],
		},
		size: {
			control: { type: "select" },
			options: ["sm", "md"],
		},
		mono: { control: { type: "boolean" } },
	},
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Neutral: Story = {
	args: {
		children: "neutral",
		variant: "neutral",
		appearance: "solid",
		size: "md",
	},
};

export const Info: Story = {
	args: {
		children: "info",
		variant: "info",
		appearance: "solid",
		size: "md",
	},
};

export const Warning: Story = {
	args: {
		children: "warning",
		variant: "warning",
		appearance: "solid",
		size: "md",
	},
};

export const Success: Story = {
	args: {
		children: "success",
		variant: "success",
		appearance: "solid",
		size: "md",
	},
};

export const Danger: Story = {
	args: {
		children: "danger",
		variant: "danger",
		appearance: "solid",
		size: "md",
	},
};

export const MonoNeutral: Story = {
	args: {
		children: "REQ-12345",
		variant: "neutral",
		mono: true,
		appearance: "solid",
		size: "sm",
	},
};

export const OutlineExamples: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Tag variant="neutral" appearance="outline">
				neutral
			</Tag>
			<Tag variant="info" appearance="outline">
				info
			</Tag>
			<Tag variant="warning" appearance="outline">
				warning
			</Tag>
			<Tag variant="success" appearance="outline">
				success
			</Tag>
			<Tag variant="danger" appearance="outline">
				danger
			</Tag>
			<Tag variant="neutral" appearance="outline" size="sm">
				sm neutral
			</Tag>
		</div>
	),
};
