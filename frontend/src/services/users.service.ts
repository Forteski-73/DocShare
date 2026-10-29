import { api } from "./api";
import type { PaginatedResult, Role, User, UserStatus } from "../types";

export type ListUsersParams = {
  page?: number;
  pageSize?: number;
  role?: Role;
  status?: UserStatus;
};

export async function list(params: ListUsersParams) {
  const { data } = await api.get<PaginatedResult<User>>("/users", { params });
  return data;
}

export async function getById(id: string) {
  const { data } = await api.get<{ user: User }>(`/users/${id}`);
  return data.user;
}

export async function create(input: { badgeNumber: string; email: string; role: Role }) {
  const { data } = await api.post<{ user: User }>("/users", input);
  return data.user;
}

export async function update(
  id: string,
  input: Partial<{ badgeNumber: string; email: string; role: Role; status: UserStatus }>
) {
  const { data } = await api.patch<{ user: User }>(`/users/${id}`, input);
  return data.user;
}

export async function deactivate(id: string) {
  const { data } = await api.delete<{ user: User }>(`/users/${id}`);
  return data.user;
}

export async function resendInvite(id: string) {
  await api.post(`/users/${id}/resend-invite`);
}

export function avatarUrl(id: string, version?: string | null) {
  const base = `${api.defaults.baseURL}/users/${id}/avatar`;
  return version ? `${base}?v=${encodeURIComponent(version)}` : base;
}
