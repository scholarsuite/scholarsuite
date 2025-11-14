import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { Card } from "./Card";

type Story = StoryObj<typeof Card>;
type Meta = MetaObj<typeof Card>;

export const Default: Story = {
	args: {
		children: (
			<div className="p-6">
				<h3 className="text-lg font-semibold mb-2">Card title</h3>
				<p className="text-sm text-slate-600 dark:text-white/70">
					A short description inside the glass card.
				</p>
			</div>
		),
		innerClassName: "",
		glass: true,
	},
};

export const Plain: Story = {
	args: {
		children: (
			<div className="p-6">
				<h3 className="text-lg font-semibold mb-2">Plain card</h3>
				<p className="text-sm text-slate-600 dark:text-white/70">
					Disable the glass effect using `glass={false}`.
				</p>
			</div>
		),
		glass: false,
	},
};

export default { component: Card } as Meta;
