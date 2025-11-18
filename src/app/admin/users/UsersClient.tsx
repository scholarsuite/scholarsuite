"use client";

import { useTranslations } from "next-intl";
import type { FC, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "#components/Common/Button.tsx";
import { Input } from "#components/Common/Input.tsx";
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

export function UsersClient({ defaultRole }: UsersClientProps) {
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
				throw new Error(`Failed to load users (${response.status})`);
			}

			const payload = (await response.json()) as { users: ApiUser[] };
			setUsers(payload.users);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Failed to load users");
		} finally {
			setState("idle");
		}
	}, []);

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
					throw new Error(body.error ?? "Failed to create user");
				}

				const json = (await response.json()) as { user: ApiUser };
				setUsers((prev) => [json.user, ...prev]);
				resetForm();
			} catch (cause) {
				setCreateError(
					cause instanceof Error ? cause.message : "Failed to create user",
				);
			} finally {
				setState("idle");
			}
		},
		[createForm, resetForm],
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
						{createError ? (
							<p className="text-sm text-red-500">{createError}</p>
						) : null}
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
					<table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
						<thead className="bg-slate-50 dark:bg-white/5">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									{t("nameColumn")}
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									{t("emailColumn")}
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									{t("rolesColumn")}
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									{t("statusColumn")}
								</th>
								<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
									{t("actionsColumn")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200 bg-white dark:divide-white/10 dark:bg-white/2">
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
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}

type UserRowProps = {
	user: ApiUser;
	onUpdated: (user: ApiUser) => void;
	roleOptions: string[];
};

const UserRow: FC<UserRowProps> = ({ user, onUpdated, roleOptions }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [localUser, setLocalUser] = useState(() => ({
		name: user.name,
		email: user.email,
		firstName: user.firstName ?? "",
		lastName: user.lastName ?? "",
		preferredLanguage: user.preferredLanguage ?? "",
		roles: user.roles,
	}));
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setLocalUser({
			name: user.name,
			email: user.email,
			firstName: user.firstName ?? "",
			lastName: user.lastName ?? "",
			preferredLanguage: user.preferredLanguage ?? "",
			roles: user.roles,
		});
	}, [user]);

	const toggleRole = (role: string) => {
		setLocalUser((prev) => {
			const hasRole = prev.roles.includes(role);
			return {
				...prev,
				roles: hasRole
					? prev.roles.filter((existing) => existing !== role)
					: [...prev.roles, role],
			};
		});
	};

	const saveChanges = async () => {
		setSaving(true);
		setError(null);
		try {
			const response = await fetch(`/api/admin/users/${user.id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: localUser.name.trim(),
					email: localUser.email.trim(),
					firstName: localUser.firstName.trim() || null,
					lastName: localUser.lastName.trim() || null,
					preferredLanguage: localUser.preferredLanguage.trim() || null,
					roles: localUser.roles,
				}),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? "Failed to update user");
			}

			const payload = (await response.json()) as { user: ApiUser };
			onUpdated(payload.user);
			setIsEditing(false);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Failed to update user",
			);
		} finally {
			setSaving(false);
		}
	};

	const toggleArchive = async () => {
		setSaving(true);
		setError(null);
		try {
			const response = await fetch(`/api/admin/users/${user.id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ archived: !user.archived }),
			});

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? "Failed to toggle archive state");
			}

			const payload = (await response.json()) as { user: ApiUser };
			onUpdated(payload.user);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Failed to toggle archive state",
			);
		} finally {
			setSaving(false);
		}
	};

	const resetPassword = async () => {
		const password = window.prompt(
			`Enter the new password for ${user.email} (minimum 8 characters)`,
		);
		if (!password) {
			return;
		}
		if (password.length < 8) {
			setError("Password must contain at least 8 characters");
			return;
		}

		setSaving(true);
		setError(null);
		try {
			const response = await fetch(
				`/api/admin/users/${user.id}/reset-password`,
				{
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ password }),
				},
			);

			if (!response.ok) {
				const body = (await response.json()) as { error?: string };
				throw new Error(body.error ?? "Failed to reset password");
			}
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Failed to reset password",
			);
		} finally {
			setSaving(false);
		}
	};

	const statusLabel = useMemo(
		() => (user.archived ? "Archived" : "Active"),
		[user.archived],
	);

	return (
		<tr>
			<td className="px-4 py-4 align-top">
				{isEditing ? (
					<Input
						value={localUser.name}
						onChange={(event) =>
							setLocalUser((prev) => ({ ...prev, name: event.target.value }))
						}
					/>
				) : (
					<div className="space-y-1">
						<p className="font-medium text-slate-900 dark:text-white">
							{user.name}
						</p>
						{user.firstName || user.lastName ? (
							<p className="text-xs text-slate-500 dark:text-slate-300">
								{[user.firstName, user.lastName].filter(Boolean).join(" ")}
							</p>
						) : null}
					</div>
				)}
			</td>
			<td className="px-4 py-4 align-top">
				{isEditing ? (
					<Input
						type="email"
						value={localUser.email}
						onChange={(event) =>
							setLocalUser((prev) => ({ ...prev, email: event.target.value }))
						}
					/>
				) : (
					<p className="text-sm text-slate-700 dark:text-slate-200">
						{user.email}
					</p>
				)}
			</td>
			<td className="px-4 py-4 align-top">
				{isEditing ? (
					<div className="flex flex-wrap gap-2">
						{roleOptions.map((role) => {
							const checked = localUser.roles.includes(role);
							return (
								<label
									key={role}
									className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:text-white/70"
								>
									<input
										type="checkbox"
										checked={checked}
										onChange={() => toggleRole(role)}
									/>
									<span>{role.replaceAll("_", " ")}</span>
								</label>
							);
						})}
					</div>
				) : (
					<p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/60">
						{user.roles.join(", ")}
					</p>
				)}
			</td>
			<td className="px-4 py-4 align-top">
				<span
					className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${user.archived ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}
				>
					{statusLabel}
				</span>
			</td>
			<td className="px-4 py-4 align-top text-right">
				<div className="flex flex-wrap justify-end gap-2">
					<Button
						onClick={() => setIsEditing((prev) => !prev)}
						disabled={saving}
					>
						{isEditing ? "Cancel" : "Edit"}
					</Button>
					{isEditing ? (
						<Button onClick={() => void saveChanges()} disabled={saving}>
							{saving ? "Saving..." : "Save"}
						</Button>
					) : null}
					<Button onClick={() => void toggleArchive()} disabled={saving}>
						{user.archived ? "Unarchive" : "Archive"}
					</Button>
					<Button onClick={() => void resetPassword()} disabled={saving}>
						Reset password
					</Button>
				</div>
				{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
			</td>
		</tr>
	);
};
