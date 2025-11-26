"use client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { FC } from "react";
import { Button } from "#components/Common/Button.tsx";
import { authClient } from "#lib/auth-client.ts";

const { useSession, signOut, listAccounts } = authClient;

const LandingPage: FC = () => {
	const { data } = useSession();
	const router = useRouter();
	const locale = useLocale();

	return (
		<>
			<div className="p-8 flex items-center justify-center">
				<Button
					onClick={async () => {
						await signOut();
						router.push("/");
					}}
				>
					Se déconnecter
				</Button>
			</div>
			<p>Current locale: {locale}</p>
			<pre className="max-w-3xl p-4  rounded-md my-4 overflow-x-auto">
				{JSON.stringify(data, null, 2)}
			</pre>
			<p>list account</p>
			<pre>{JSON.stringify(listAccounts(), null, 2)}</pre>
		</>
	);
};

export default LandingPage;
