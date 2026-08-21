import { api } from "./api";
import type { Label, LabelDetail, LabelType } from "../types";

export async function list(params: { type?: LabelType } = {}) {
  const { data } = await api.get<{ labels: Label[] }>("/labels", { params });
  return data.labels;
}

export async function getById(id: string) {
  const { data } = await api.get<{ label: LabelDetail }>(`/labels/${id}`);
  return data.label;
}

export async function create(input: { name: string; description?: string; type: LabelType }) {
  const { data } = await api.post<{ label: Label }>("/labels", input);
  return data.label;
}

export async function update(id: string, input: Partial<{ name: string; description: string }>) {
  const { data } = await api.patch<{ label: Label }>(`/labels/${id}`, input);
  return data.label;
}

export async function remove(id: string) {
  await api.delete(`/labels/${id}`);
}

export async function uploadPhoto(id: string, file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  const { data } = await api.post<{ label: Label }>(`/labels/${id}/photo`, formData);
  return data.label;
}

export async function removePhoto(id: string) {
  const { data } = await api.delete<{ label: Label }>(`/labels/${id}/photo`);
  return data.label;
}

export function photoUrl(id: string, version?: string | null) {
  const base = `${api.defaults.baseURL}/labels/${id}/photo`;
  return version ? `${base}?v=${encodeURIComponent(version)}` : base;
}
