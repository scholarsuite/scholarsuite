'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
	const router = useRouter();

	const handleLogout = () => {
		signOut({ redirect: false }).then(() => {
			router.push('/login');
		});
	};

	return (
		<div>
			<button onClick={handleLogout}>Logout</button>
		</div>
	);
}
