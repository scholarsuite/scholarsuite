"use client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { FC } from "react";
import { authClient } from "#lib/auth-client.ts";

const { useSession, signOut, listAccounts } = authClient;

const LandingPage: FC = () => {
	const { data } = useSession();
	const router = useRouter();
	const locale = useLocale();

	return (
		<>
			<div className="p-8 flex items-center justify-center">
				<button
					type="button"
					onClick={async () => {
						await signOut();
						router.push("/");
					}}
					className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition duration-200 ease-out overflow-hidden bg-slate-100 border border-slate-200 text-slate-900 shadow-sm hover:scale-[1.02] active:scale-95 hover:bg-slate-50 dark:bg-white/8 dark:border-white/20 dark:text-white dark:backdrop-blur-md dark:shadow-lg dark:hover:bg-white/12"
				>
					<span className="absolute inset-0 pointer-events-none rounded-xl border border-slate-200 dark:border-white/10" />
					<span className="absolute -left-10 -top-6 w-36 h-40 bg-linear-to-br from-slate-700/20 via-slate-600/10 to-transparent opacity-30 transform -rotate-12 blur-xl transition-transform duration-500 ease-out group-hover:translate-x-10 group-hover:scale-110 group-active:translate-x-6 dark:from-white/40 dark:via-white/10 dark:to-transparent" />
					<span className="z-10 font-semibold">Se déconnecter</span>
				</button>
			</div>
			<p>Current locale: {locale}</p>
			<pre className="min-h-screen w-screen flex items-center justify-center p-8 bg-white dark:bg-black text-slate-900 dark:text-white">
				{JSON.stringify(data, null, 2)}
			</pre>
			<p>list account</p>
			<pre>{JSON.stringify(listAccounts(), null, 2)}</pre>
		</>
	);
};

export default LandingPage;
