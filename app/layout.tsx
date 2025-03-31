import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import type { FC, PropsWithChildren } from 'react';
import '~/styles/globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
	<html lang="en">
		<body
			className={`${geistSans.variable} ${geistMono.variable} bg-white text-black antialiased dark:bg-black dark:text-white`}
		>
			<SessionProvider>{children}</SessionProvider>
		</body>
	</html>
);

export default RootLayout;
