import type { Meta as MetaObj, StoryObj } from '@storybook/react';
import { Label } from './Label';

type Story = StoryObj<typeof Label>;
type Meta = MetaObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Email',
    htmlFor: 'email',
  },
};

export const ScreenReaderOnly: Story = {
  args: {
    children: 'Hidden label for screen readers',
    srOnly: true,
    htmlFor: 'hidden-input',
  },
};

export default { component: Label } as Meta;
