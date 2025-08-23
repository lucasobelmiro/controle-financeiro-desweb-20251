import { expect } from "chai";
import request from "supertest";
import { app } from "../src/app";

describe("User API", () => {
  it("POST /users/register - cria usuário válido (201)", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({
        name: "Lucas",
        email: `lucas_${Date.now()}@ex.com`,
        password: "123456",
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("email");
  });

  it("POST /users/register - falta email (400)", async () => {
    const res = await request(app).post("/users/register").send({
      name: "SemEmail",
      password: "123456",
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "Email e senha são obrigatórios"
    );
  });

  it("POST /users/register - email inválido (400)", async () => {
    const res = await request(app).post("/users/register").send({
      name: "InvalidEmail",
      email: "abc",
      password: "123456",
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Email inválido");
  });

  it("POST /users/register - email duplicado (400)", async () => {
    const email = `dup_${Date.now()}@ex.com`;
    await request(app)
      .post("/users/register")
      .send({ name: "Dup", email, password: "123456" });
    const res = await request(app)
      .post("/users/register")
      .send({ name: "Dup2", email, password: "123456" });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "E-mail já cadastrado");
  });

  it("POST /users/login - válido e GET /users (200)", async () => {
    const reg = await request(app)
      .post("/users/register")
      .send({
        name: "Admin",
        email: `admin_${Date.now()}@ex.com`,
        password: "123456",
        role: "admin",
      });
    expect(reg.status).to.equal(201);

    const login = await request(app).post("/users/login").send({
      email: reg.body.email,
      password: "123456",
    });
    expect(login.status).to.equal(200);
    const token = login.body.token;

    const list = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).to.equal(200);
    expect(list.body).to.be.an("array");
  });

  it("POST /users/login - inválido (401)", async () => {
    const res = await request(app).post("/users/login").send({
      email: "nao_existe@ex.com",
      password: "errada",
    });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("message", "Usuário ou senha inválidos");
  });

  it("GET /users/:id - existente (200)", async () => {
    const created = await request(app)
      .post("/users/register")
      .send({
        name: "GetById",
        email: `getid_${Date.now()}@ex.com`,
        password: "123456",
      });
    const login = await request(app).post("/users/login").send({
      email: created.body.email,
      password: "123456",
    });
    const token = login.body.token;

    const res = await request(app)
      .get(`/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equals(200);
    expect(res.body).to.have.property("id", created.body.id);
  });

  it("PUT /users/:id - atualizar sucesso (200)", async () => {
    const created = await request(app)
      .post("/users/register")
      .send({
        name: "PutUser",
        email: `put_${Date.now()}@ex.com`,
        password: "123456",
      });
    const login = await request(app).post("/users/login").send({
      email: created.body.email,
      password: "123456",
    });
    const token = login.body.token;

    const res = await request(app)
      .put(`/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "PutUserUpdated" });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("name", "PutUserUpdated");
  });

  it("PUT /users/:id - atualizar com email inválido (400)", async () => {
    const created = await request(app)
      .post("/users/register")
      .send({
        name: "PutInvalid",
        email: `putinv_${Date.now()}@ex.com`,
        password: "123456",
      });
    const login = await request(app).post("/users/login").send({
      email: created.body.email,
      password: "123456",
    });
    const token = login.body.token;

    const res = await request(app)
      .put(`/users/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "sem_formato" });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Erro ao atualizar usuário");
  });

  it("DELETE /users/:id - sucesso (204) e não permite excluir com transações (400)", async () => {
    const u1 = await request(app)
      .post("/users/register")
      .send({
        name: "DelUser",
        email: `del_${Date.now()}@ex.com`,
        password: "123456",
      });
    const l1 = await request(app).post("/users/login").send({
      email: u1.body.email,
      password: "123456",
    });
    const t1 = l1.body.token;
    const del = await request(app)
      .delete(`/users/${u1.body.id}`)
      .set("Authorization", `Bearer ${t1}`);
    expect(del.status).to.equal(204);

    const u2 = await request(app)
      .post("/users/register")
      .send({
        name: "HasTx",
        email: `has_${Date.now()}@ex.com`,
        password: "123456",
      });
    const l2 = await request(app).post("/users/login").send({
      email: u2.body.email,
      password: "123456",
    });
    const t2 = l2.body.token;

    const cat = await request(app)
      .post("/categories")
      .send({ name: `C_${Date.now()}` });
    await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${t2}`)
      .send({
        categoryId: cat.body.id,
        tipo: "entrada",
        valor: 10,
        data: "2025-07-01",
      });

    const del2 = await request(app)
      .delete(`/users/${u2.body.id}`)
      .set("Authorization", `Bearer ${t2}`);
    expect(del2.status).to.equal(400);
    expect(del2.body).to.have.property(
      "message",
      "Não é possível excluir usuário com transações associadas"
    );
  });
});
