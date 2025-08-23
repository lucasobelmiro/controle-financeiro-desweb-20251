import { expect } from "chai";
import request from "supertest";
import { app } from "../src/app";

async function register(app: any, body: any) {
  return request(app).post("/users/register").send(body);
}
async function login(app: any, email: string, password: string) {
  return request(app).post("/users/login").send({ email, password });
}

describe("Admin authorization", () => {
  let userToken = "";
  let adminToken = "";

  before(async () => {
    const uEmail = `user_${Date.now()}@test.com`;
    const aEmail = `admin_${Date.now()}@test.com`;

    await register(app, { name: "User", email: uEmail, password: "123456" });
    const uLogin = await login(app, uEmail, "123456");
    userToken = uLogin.body.token;

    await register(app, {
      name: "Admin",
      email: aEmail,
      password: "123456",
      role: "admin",
    });
    const aLogin = await login(app, aEmail, "123456");
    adminToken = aLogin.body.token;
  });

  it("GET /users - NEGADO para usuário comum (403)", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).to.equal(403);
  });

  it("GET /users - PERMITIDO para admin (200)", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });
});
