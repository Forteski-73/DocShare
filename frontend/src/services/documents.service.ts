import { api } from "./api";
import type { DocumentItem, PaginatedResult } from "../types";

export type ListDocumentsParams = {
  categoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function list(params: ListDocumentsParams) {
  const { data } = await api.get<PaginatedResult<DocumentItem>>("/documents", { params });
  return data;
}

export async function upload(input: { categoryId: string; file: File; notify: boolean }) {
  const formData = new FormData();
  formData.append("categoryId", input.categoryId);
  formData.append("notify", String(input.notify));
  formData.append("file", input.file);

  const { data } = await api.post<{ document: DocumentItem }>("/documents", formData);
  return data.document;
}

export async function notify(id: string, input: { toAll: boolean; userIds?: string[] }) {
  const { data } = await api.post<{ recipientCount: number }>(`/documents/${id}/notify`, input);
  return data.recipientCount;
}

export async function remove(id: string) {
  await api.delete(`/documents/${id}`);
}

export function downloadUrl(id: string) {
  return `${api.defaults.baseURL}/documents/${id}/download`;
}

export function viewUrl(id: string) {
  return `${api.defaults.baseURL}/documents/${id}/download?inline=true`;
}
