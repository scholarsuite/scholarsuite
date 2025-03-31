import GitHub from 'next-auth/providers/github';
import type { NextAuthConfig } from 'next-auth';

export default {
	providers: [GitHub],
	pages: {
		signIn: '/login',
		signOut: '/logout',
	},
	callbacks: {
		authorized: async ({ auth }) => {
			// Logged in users are authenticated, otherwise redirect to login page
			return !!auth;
		},
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
} as NextAuthConfig;
