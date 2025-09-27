import { api } from "./api";

export type UserRole = "user" | "admin";

export type UserDTO = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
};

export async function getUsers() {
  const { data } = await api.get<UserDTO[]>("/users");
  return data ?? [];
}

export async function createUser(payload: CreateUserInput) {
  const { data } = await api.post<UserDTO>("/users/register", payload);
  return data;
}

export async function updateUser(id: number, data: UpdateUserInput) {
  const res = await api.put(`/users/${id}`, data);
  return res.data as UserDTO;
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`);
}
