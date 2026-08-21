import { api } from "./api";
import type { AppSettings } from "../types";

export async function get() {
  const { data } = await api.get<{ settings: AppSettings }>("/settings");
  return data.settings;
}

export async function uploadLogo(file: File) {
  const formData = new FormData();
  formData.append("logo", file);
  const { data } = await api.post<{ settings: AppSettings }>("/settings/logo", formData);
  return data.settings;
}

export async function removeLogo() {
  const { data } = await api.delete<{ settings: AppSettings }>("/settings/logo");
  return data.settings;
}

export async function updateHeaderColor(headerColor: string) {
  const { data } = await api.patch<{ settings: AppSettings }>("/settings/header-color", {
    headerColor,
  });
  return data.settings;
}

export function logoUrl(version?: string | null) {
  const base = `${api.defaults.baseURL}/settings/logo`;
  return version ? `${base}?v=${encodeURIComponent(version)}` : base;
}
