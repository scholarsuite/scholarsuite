"use client";

import { useTranslations } from "next-intl";
import type { FC, FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { UserRow } from "#components/admin/users/UserRow.tsx";
import { Button } from "#components/Common/Button.tsx";
import { Input } from "#components/Common/Input.tsx";
import { Table, Tbody, Th, Thead, Tr } from "#components/Common/Table.tsx";
import { USER_ROLE } from "#prisma/enums";

type ApiUser = {
	id: string;
	email: string;
	name: string;
	firstName: string | null;
	lastName: string | null;
	preferredLanguage: string | null;
	archived: boolean;
	roles: string[];
	createdAt: string;
	updatedAt: string;
};

type FetchState = "idle" | "loading" | "saving";

type CreateFormState = {
	email: string;
	name: string;
	firstName: string;
	lastName: string;
	preferredLanguage: string;
	password: string;
	roles: string[];
};

type UsersClientProps = {
	defaultRole: string;
};

const buildDefaultCreateForm = (defaultRole: string): CreateFormState => ({
	email: "",
	name: "",
	firstName: "",
	lastName: "",
	preferredLanguage: "",
	password: "",
	roles: [defaultRole],
});

export const UsersClient: FC<UsersClientProps> = ({ defaultRole }) => {
	const t = useTranslations("app.admin.users");

	const [users, setUsers] = useState<ApiUser[]>([]);
	const [state, setState] = useState<FetchState>("loading");
	const [error, setError] = useState<string | null>(null);
	const [createForm, setCreateForm] = useState<CreateFormState>(() =>
		buildDefaultCreateForm(defaultRole),
	);
	const [createError, setCreateError] = useState<string | null>(null);

	const loadUsers = useCallback(async () => {
		setState("loading");
		setError(null);
		try {
			const response = await fetch("/api/admin/users", {
				credentials: "include",
				cache: "no-store",
			});

			if (!response.ok) {
				throw new Error(t("loadingUsers"));
			}

			const payload = (await response.json()) as { users: ApiUser[] };
			setUsers(payload.users);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : t("loadingUsers"));
		} finally {
			setState("idle");
		}
	}, [t]);

	useEffect(() => {
		void loadUsers();
	}, [loadUsers]);

	const resetForm = useCallback(() => {
		setCreateForm(buildDefaultCreateForm(defaultRole));
		setCreateError(null);
	}, [defaultRole]);

	const handleRoleToggle = useCallback((role: string) => {
		setCreateForm((prev) => {
			const hasRole = prev.roles.includes(role);
			return {
				...prev,
				roles: hasRole
					? prev.roles.filter((existing) => existing !== role)
					: [...prev.roles, role],
			};
		});
	}, []);

	const handleCreate = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			setCreateError(null);
			setState("saving");

			try {
				const payload = {
					email: createForm.email.trim(),
					name: createForm.name.trim(),
					firstName: createForm.firstName.trim() || undefined,
					lastName: createForm.lastName.trim() || undefined,
					preferredLanguage: createForm.preferredLanguage.trim() || undefined,
					password: createForm.password.trim() || undefined,
					roles: createForm.roles,
				};

				const response = await fetch("/api/admin/users", {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const body = (await response.json()) as { error?: string };
					throw new Error(body.error ?? t("createUser"));
				}

				const json = (await response.json()) as { user: ApiUser };
				setUsers((prev) => [json.user, ...prev]);
				resetForm();
			} catch (cause) {
				setCreateError(
					cause instanceof Error ? cause.message : t("createUser"),
				);
			} finally {
				setState("idle");
			}
		},
		[createForm, resetForm, t],
	);

	const handleUserUpdated = useCallback((updatedUser: ApiUser) => {
		setUsers((prev) =>
			prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
		);
	}, []);

	const isSaving = state === "saving";

	return (
		<div className="space-y-12">
			<section className="space-y-4">
				<form
					onSubmit={handleCreate}
					className="grid gap-4 rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/4"
				>
					<h2 className="text-lg font-medium text-slate-900 dark:text-white">
						{t("createNewUser")}
					</h2>

					<div className="grid gap-4 sm:grid-cols-2">
						<Input
							required
							type="email"
							value={createForm.email}
							onChange={(event) =>
								setCreateForm((prev) => ({
									...prev,
									email: event.target.value,
								}))
							}
							placeholder={t("emailPlaceholder")}
						/>
						<Input
							required
							value={createForm.name}
							onChange={(event) =>
								setCreateForm((prev) => ({ ...prev, name: event.target.value }))
							}
							placeholder={t("displayNamePlaceholder")}
						/>
						<Input
							value={createForm.firstName}
							onChange={(event) =>
								setCreateForm((prev) => ({
									...prev,
									firstName: event.target.value,
								}))
							}
							placeholder={t("firstNamePlaceholder")}
						/>
						<Input
							value={createForm.lastName}
							onChange={(event) =>
								setCreateForm((prev) => ({
									...prev,
									lastName: event.target.value,
								}))
							}
							placeholder={t("lastNamePlaceholder")}
						/>
						<Input
							value={createForm.preferredLanguage}
							onChange={(event) =>
								setCreateForm((prev) => ({
									...prev,
									preferredLanguage: event.target.value,
								}))
							}
							placeholder={t("preferredLanguagePlaceholder")}
						/>
						<Input
							type="password"
							value={createForm.password}
							onChange={(event) =>
								setCreateForm((prev) => ({
									...prev,
									password: event.target.value,
								}))
							}
							placeholder={t("temporaryPasswordPlaceholder")}
							description={t("temporaryPasswordDescription")}
						/>
					</div>

					<div className="space-y-2">
						<p className="text-sm font-medium text-slate-700 dark:text-slate-200">
							{t("rolesLabel")}
						</p>
						<div className="flex flex-wrap gap-3">
							{Object.values(USER_ROLE)
								.filter((role) => role !== USER_ROLE.STUDENT)
								.map((role) => {
									const checked = createForm.roles.includes(role);
									return (
										<label
											key={role}
											className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
										>
											<input
												type="checkbox"
												checked={checked}
												onChange={() => handleRoleToggle(role)}
											/>
											<span>{role.replaceAll("_", " ")}</span>
										</label>
									);
								})}
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Button type="submit" disabled={isSaving}>
							{isSaving ? t("creating") : t("createUser")}
						</Button>
						<Button type="button" onClick={resetForm} disabled={isSaving}>
							{t("reset")}
						</Button>
						{createError && (
							<p className="text-sm text-red-500">{createError}</p>
						)}
					</div>
				</form>
			</section>

			<section className="space-y-3">
				<header className="flex items-center justify-between">
					<h2 className="text-lg font-medium text-slate-900 dark:text-white">
						{t("existingUsers")}
					</h2>
					<Button
						onClick={() => void loadUsers()}
						disabled={state === "loading"}
					>
						{state === "loading" ? t("refreshing") : t("refresh")}
					</Button>
				</header>

				{error ? <p className="text-sm text-red-500">{error}</p> : null}

				<div className="overflow-x-auto">
					<Table>
						<Thead>
							<Tr>
								<Th>{t("nameColumn")}</Th>
								<Th>{t("emailColumn")}</Th>
								<Th>{t("rolesColumn")}</Th>
								<Th>{t("statusColumn")}</Th>
								<Th className="text-right">{t("actionsColumn")}</Th>
							</Tr>
						</Thead>
						<Tbody>
							{users.map((user) => (
								<UserRow
									key={user.id}
									user={user}
									onUpdated={handleUserUpdated}
									roleOptions={Object.values(USER_ROLE).filter(
										(role) => role !== USER_ROLE.STUDENT,
									)}
								/>
							))}
						</Tbody>
					</Table>
				</div>
			</section>
		</div>
	);
};
