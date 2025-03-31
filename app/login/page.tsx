'use client';
import { signIn } from 'next-auth/react';
import type { FC } from 'react';

const LoginPage: FC = () => (
	<div>
		<h1>Login</h1>
		<button onClick={() => signIn('github')}>Sign in with GitHub</button>
	</div>
);

export default LoginPage;
