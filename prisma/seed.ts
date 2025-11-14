import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "#prisma/client";

const prisma = new PrismaClient();

async function prompt(question: string): Promise<string> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer);
			rl.close();
		});
	});
}

const name = await prompt("Enter admin full name: ");
const email = await prompt("Enter admin email: ");
const password = await prompt("Enter admin password: ").then((pwd) =>
	hashPassword(pwd),
);

const user = await prisma.user.create({
	data: {
		email: String(email).toLowerCase(),
		name,
	},
});

// Create SYSTEM_ADMIN role for the first user
await prisma.userRole.create({
	data: {
		userId: user.id,
		role: "SYSTEM_ADMIN",
	},
});

// Create an Account credential for Better Auth.
// Better Auth expects the credential provider to be named `credential`.
await prisma.account.create({
	data: {
		id: randomUUID(),
		accountId: String(email).toLowerCase(),
		providerId: "credential",
		userId: user.id,
		password,
	},
});

console.log(`Created admin user ${email} (id=${user.id})`);
await prisma.$disconnect();
