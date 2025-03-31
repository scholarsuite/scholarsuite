import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma.ts';
import authConfig from './auth-config.ts';
import type { User as PrismaUser } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {

	/**
	 * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: PrismaUser & DefaultSession['user'];
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },
	...authConfig,
});
