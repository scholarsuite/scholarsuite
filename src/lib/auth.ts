import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { PrismaClient } from "#prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
	appName: "ScholarSuite",
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			// Disable implicit signup: only allow sign-in if an existing user
			// with the provider email is already present in the DB.
			disableImplicitSignUp: true,
		},
	},
	// Only allow email/password sign-in for users that already exist
	// in the database. Disable self-service signups.
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	// Ensure accounts returned by social providers are linked to existing
	// users when possible and restrict linking to trusted providers.
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["github"],
			updateUserInfoOnLink: true,
		},
	},
	// Extra safety: block user creation if provider didn't return an email.
	// This prevents accidental creation of users without emails.
	databaseHooks: {
		user: {
			create: {
				before: async (user, ctx) => {
					if (!user?.email) {
						return false;
					}
					// normalize email
					user.email = String(user.email).toLowerCase();
					// allow core to proceed and link if a matching user exists
					return;
				}
			}
		}
	},
	plugins: [nextCookies()],
});

