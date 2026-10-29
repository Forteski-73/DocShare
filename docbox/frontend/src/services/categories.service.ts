import { api } from "./api";
import type { CategoryWithCount, CategoryDetail } from "../types";

export async function list(labelId: string) {
  const { data } = await api.get<{ categories: CategoryWithCount[] }>("/categories", {
    params: { labelId },
  });
  return data.categories;
}

export async function getById(id: string) {
  const { data } = await api.get<{ category: CategoryDetail }>(`/categories/${id}`);
  return data.category;
}

export async function create(input: { labelId: string; name: string; description?: string }) {
  const { data } = await api.post<{ category: CategoryDetail }>("/categories", input);
  return data.category;
}

export async function update(id: string, input: Partial<{ name: string; description: string }>) {
  const { data } = await api.patch<{ category: CategoryDetail }>(`/categories/${id}`, input);
  return data.category;
}

export async function remove(id: string) {
  await api.delete(`/categories/${id}`);
}
