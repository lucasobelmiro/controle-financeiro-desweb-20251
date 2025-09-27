import { api } from "./api";

export type CategoryDTO = { id: number; name: string };

export async function getCategories() {
  const { data } = await api.get<CategoryDTO[]>("/categories");
  return data;
}

export async function createCategory(name: string) {
  const { data } = await api.post("/categories", { name });
  return data as CategoryDTO;
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`);
}
