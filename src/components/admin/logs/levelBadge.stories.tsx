import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { LOG_LEVEL } from "#prisma/enums";
import { LevelBadge } from "./LevelBadge";

type Story = StoryObj<typeof LevelBadge>;
type Meta = MetaObj<typeof LevelBadge>;

export const Debug: Story = {
	args: { level: LOG_LEVEL.DEBUG },
};

export const Info: Story = {
	args: { level: LOG_LEVEL.INFO },
};

export const Warn: Story = {
	args: { level: LOG_LEVEL.WARN },
};

export const ErrorLevel: Story = {
	args: { level: LOG_LEVEL.ERROR },
};

export default { component: LevelBadge } as Meta;
