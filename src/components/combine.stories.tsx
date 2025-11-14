import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { Button } from "#components/Common/Button.tsx";
import { Card } from "#components/Common/Card.tsx";
import { Input } from "#components/Common/Input.tsx";
import { Label } from "#components/Common/Label.tsx";

type Story = StoryObj<typeof Card>;
type Meta = MetaObj<typeof Card>;

export const LoginForm: Story = {
	render: () => (
		<div className="space-y-6 max-w-md mx-auto">
			<Card innerClassName="p-6" glass>
				<h3 className="text-xl font-semibold mb-4">Connexion (composition)</h3>
				<div className="space-y-4">
					<div>
						<Label htmlFor="email">Email</Label>
						<Input id="email" placeholder="you@example.com" />
					</div>
					<div>
						<Label htmlFor="password">Mot de passe</Label>
						<Input id="password" type="password" placeholder="••••••••" />
					</div>
					<div className="flex justify-end">
						<Button className="w-full">Se connecter</Button>
					</div>
				</div>
			</Card>

			<Card innerClassName="p-6" glass={false}>
				<h4 className="mb-2">State preview</h4>
				<pre style={{ whiteSpace: "pre-wrap" }}>
					{JSON.stringify({ demo: true }, null, 2)}
				</pre>
			</Card>
		</div>
	),
};

export default { component: Card, title: "Composition/Integration" } as Meta;
