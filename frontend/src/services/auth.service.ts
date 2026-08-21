import { api } from "./api";
import type { CurrentUser } from "../types";

export async function login(identifier: string, password: string, turnstileToken: string) {
  const { data } = await api.post<{ user: CurrentUser }>("/auth/login", {
    identifier,
    password,
    turnstileToken,
  });
  return data.user;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function me() {
  const { data } = await api.get<{ user: CurrentUser }>("/auth/me");
  return data.user;
}

export async function activateAccount(token: string, password: string) {
  await api.post("/auth/activate-account", { token, password });
}

export async function forgotPassword(identifier: string) {
  const { data } = await api.post<{ message: string }>("/auth/forgot-password", { identifier });
  return data.message;
}

export async function resetPassword(token: string, password: string) {
  await api.post("/auth/reset-password", { token, password });
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.post<{ avatarPath: string | null }>("/auth/me/avatar", formData);
  return data.avatarPath;
}

export async function removeAvatar() {
  const { data } = await api.delete<{ avatarPath: string | null }>("/auth/me/avatar");
  return data.avatarPath;
}

export function avatarUrl(version?: string | null) {
  const base = `${api.defaults.baseURL}/auth/me/avatar`;
  return version ? `${base}?v=${encodeURIComponent(version)}` : base;
}
