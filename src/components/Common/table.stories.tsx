import type { Meta as MetaObj, StoryObj } from "@storybook/react";
import { Table, Tbody, Td, Th, Thead, Tr } from "./Table";

type Story = StoryObj<typeof Table>;
type Meta = MetaObj<typeof Table>;

export const Default: Story = {
	render: () => (
		<div className="overflow-x-auto">
			<Table>
				<Thead>
					<Tr>
						<Th>Name</Th>
						<Th>Email</Th>
						<Th>Status</Th>
						<Th className="text-right">Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					<Tr>
						<Td>Jane Doe</Td>
						<Td>jane@example.com</Td>
						<Td>Active</Td>
						<Td className="text-right">...</Td>
					</Tr>
					<Tr>
						<Td>John Smith</Td>
						<Td>john@example.com</Td>
						<Td>Archived</Td>
						<Td className="text-right">...</Td>
					</Tr>
				</Tbody>
			</Table>
		</div>
	),
};

export default { component: Table } as Meta;
