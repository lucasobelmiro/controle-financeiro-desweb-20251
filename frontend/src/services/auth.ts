import { api } from "./api";
import type { AuthResponse, User } from "../types";

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/users/login", {
    email,
    password,
  });
  return data;
}

export function saveSession({ user, token }: AuthResponse) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
}) {
  await api.post("/users/register", payload);
}
