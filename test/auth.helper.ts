import request from "supertest";
import { app } from "../src/app";

export async function registerAndLogin() {
  const email = `user_${Date.now()}@example.com`;

  await request(app).post("/users/register").send({
    name: "Test User",
    email,
    password: "123456",
  });

  const loginRes = await request(app).post("/users/login").send({
    email,
    password: "123456",
  });

  if (loginRes.status !== 200 || !loginRes.body?.token) {
    throw new Error(
      `Falha ao autenticar no helper (status=${loginRes.status})`
    );
  }

  return { token: loginRes.body.token, user: loginRes.body.user };
}
