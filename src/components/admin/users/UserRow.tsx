"use client";

import { useTranslations } from "next-intl";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "#components/Common/Button.tsx";
import { Input } from "#components/Common/Input.tsx";
import { StatusBadge } from "#components/Common/StatusBadge.tsx";
import { Td, Tr } from "#components/Common/Table.tsx";

export type UserRowProps = {
	user: {
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
	onUpdated: (user: UserRowProps["user"]) => void;
	roleOptions: string[];
};

export const UserRow: FC<UserRowProps> = ({ user, onUpdated, roleOptions }) => {
	const t = useTranslations("app.admin.users");

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

			const payload = (await response.json()) as { user: UserRowProps["user"] };
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

			const payload = (await response.json()) as { user: UserRowProps["user"] };
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
		const password = window.prompt(t("passwordPrompt", { email: user.email }));
		if (!password) {
			return;
		}
		if (password.length < 8) {
			setError(t("passwordTooShort"));
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
				throw new Error(body.error ?? t("resetPassword"));
			}
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : t("resetPassword"));
		} finally {
			setSaving(false);
		}
	};

	const statusLabel = useMemo(
		() => (user.archived ? t("archivedStatus") : t("activeStatus")),
		[user.archived, t],
	);

	return (
		<Tr>
			<Td>
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
			</Td>
			<Td>
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
			</Td>
			<Td>
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
			</Td>
			<Td>
				<StatusBadge variant={user.archived ? "warning" : "success"}>
					{statusLabel}
				</StatusBadge>
			</Td>
			<Td className="text-right">
				<div className="flex flex-wrap justify-end gap-2">
					<Button
						type="button"
						onClick={() => setIsEditing((prev) => !prev)}
						disabled={saving}
					>
						{isEditing ? t("cancel") : t("edit")}
					</Button>
					{isEditing ? (
						<Button
							type="button"
							onClick={() => void saveChanges()}
							disabled={saving}
						>
							{saving ? t("saving") : t("save")}
						</Button>
					) : null}
					<Button
						type="button"
						onClick={() => void toggleArchive()}
						disabled={saving}
					>
						{user.archived ? t("unarchive") : t("archive")}
					</Button>
					<Button
						type="button"
						onClick={() => void resetPassword()}
						disabled={saving}
					>
						{t("resetPassword")}
					</Button>
				</div>
				{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
			</Td>
		</Tr>
	);
};
