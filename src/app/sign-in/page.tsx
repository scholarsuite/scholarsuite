"use client";
import Image from "next/image";
import type { FC, FormEvent } from "react";
import { useState } from "react";
import { Card } from "#components/Common/Card.tsx";
import { Input } from "#components/Common/Input.tsx";
import { Label } from "#components/Common/Label.tsx";
import { authClient } from "#lib/auth-client.ts";

const { signIn } = authClient;

const SignInPage: FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			signIn.email({
				email,
				password,
				callbackURL: "/",
			});
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
			{/* Decorative subtle blurred blobs for depth */}
			<div className="absolute -top-32 -left-20 w-96 h-96 opacity-40 rounded-full filter blur-3xl transform rotate-12 pointer-events-none bg-slate-900/6 dark:bg-white/6" />
			<div className="absolute -bottom-40 -right-20 w-96 h-96 opacity-30 rounded-full filter blur-3xl transform -rotate-12 pointer-events-none bg-slate-900/4 dark:bg-white/4" />

			<Card className="relative z-10 w-full max-w-md p-8 rounded-3xl backdrop-blur-md shadow-2xl bg-white border border-slate-200 text-slate-900 dark:bg-white/6 dark:border-white/10 dark:text-white">
				<div className="flex flex-col items-center mb-6">
					<Image
						src="/logo.png"
						alt="Scholarsuite Logo"
						width={48}
						height={48}
						className="mb-4"
					/>
					<h1 className="text-2xl font-bold">Scholarsuite</h1>
					<p className="text-sm text-slate-600 dark:text-white/80">
						Gestion de vie scolaire et de scolarité
					</p>
				</div>

				<h2 className="text-lg font-semibold mb-4 text-center text-slate-700 dark:text-white">
					Connexion
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label
							htmlFor="email"
							className="block text-sm font-medium mb-2 text-slate-700 dark:text-white/80"
						>
							Email
						</Label>
						<div className="relative">
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								required
								className={`w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none transition duration-150 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 dark:bg-white/6 dark:border-white/10 dark:text-white dark:placeholder:text-white/50 dark:focus:ring-white/20 dark:focus:border-white`}
							/>
							<span className="absolute -left-6 -top-8 w-36 h-40 bg-linear-to-br from-slate-700/20 via-slate-600/10 to-transparent opacity-20 transform -rotate-12 blur-xl pointer-events-none dark:from-white/30 dark:via-white/10 dark:to-transparent" />
						</div>
					</div>

					<div>
						<Label
							htmlFor="password"
							className="block text-sm font-medium mb-2 text-slate-700 dark:text-white/80"
						>
							Mot de passe
						</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							className={`w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none transition duration-150 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-white/6 dark:border-white/10 dark:text-white dark:placeholder:text-white/50 dark:focus:ring-white/20 dark:focus:border-white`}
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className={`group relative inline-flex items-center justify-center gap-3 w-full px-6 py-3 mt-2 rounded-xl transition duration-200 ease-out overflow-hidden bg-slate-100 border border-slate-200 text-slate-900 shadow-sm hover:scale-[1.02] active:scale-95 hover:bg-slate-50 dark:bg-white/8 dark:border-white/20 dark:text-white dark:backdrop-blur-md dark:shadow-lg dark:hover:bg-white/12`}
					>
						<span className="absolute inset-0 pointer-events-none rounded-xl border border-slate-200 dark:border-white/10" />
						<span className="absolute -left-10 -top-6 w-36 h-40 bg-linear-to-br from-slate-700/20 via-slate-600/10 to-transparent opacity-30 transform -rotate-12 blur-xl transition-transform duration-500 ease-out group-hover:translate-x-10 group-hover:scale-110 group-active:translate-x-6 dark:from-white/40 dark:via-white/10 dark:to-transparent" />
						<span className="z-10 font-semibold">
							{loading ? "Connexion..." : "Se connecter"}
						</span>
					</button>
				</form>

				<div className="mt-6">
					<div className="flex items-center my-4">
						<span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
						<span className="mx-3 text-sm text-slate-500 dark:text-white/70">
							ou avec
						</span>
						<span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
					</div>

					<button
						type="button"
						disabled={loading}
						onClick={async () => {
							setLoading(true);
							try {
								signIn.social({
									provider: "github",
								});
							} catch (err) {
								console.error(err);
							} finally {
								setLoading(false);
							}
						}}
						className="group relative inline-flex items-center justify-center gap-3 w-full px-6 py-3 mt-2 rounded-xl transition duration-200 ease-out overflow-hidden bg-white border border-slate-200 text-slate-900 shadow-sm hover:scale-[1.02] active:scale-95 hover:bg-slate-50 dark:bg-white/8 dark:border-white/20 dark:text-white dark:backdrop-blur-md dark:shadow-lg dark:hover:bg-white/12"
					>
						<span className="absolute inset-0 pointer-events-none rounded-xl border border-slate-200 dark:border-white/10" />
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>GitHub</title>
							<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
							<path d="M9 18c-4.51 2-5-2-7-2" />
						</svg>

						<span className="z-10 font-semibold">
							{loading ? "Connexion..." : "Se connecter avec GitHub"}
						</span>
					</button>
				</div>
			</Card>
		</main>
	);
};

export default SignInPage;
