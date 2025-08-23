import { expect } from "chai";
import request from "supertest";
import { app } from "../src/app";

describe("Category API", () => {
  it("POST /categories - cria categoria válida (201)", async () => {
    const res = await request(app)
      .post("/categories")
      .send({
        name: `Alimentação_${Date.now()}`,
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
  });

  it("POST /categories - nome vazio (400)", async () => {
    const res = await request(app).post("/categories").send({ name: "" });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "O nome da categoria é obrigatório"
    );
  });

  it("POST /categories - nome inválido (muito curto) (400)", async () => {
    const res = await request(app).post("/categories").send({ name: "A" });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "O nome da categoria é inválido"
    );
  });

  it("GET /categories - lista (200)", async () => {
    const res = await request(app).get("/categories");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("POST e GET /categories/:id - existente (200)", async () => {
    const created = await request(app)
      .post("/categories")
      .send({ name: `Cat_${Date.now()}` });
    const res = await request(app).get(`/categories/${created.body.id}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("id", created.body.id);
  });

  it("GET /categories/:id - inexistente (404)", async () => {
    const res = await request(app).get("/categories/999999");
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("message", "Categoria não encontrada");
  });

  it("PUT /categories/:id - sucesso (200)", async () => {
    const created = await request(app)
      .post("/categories")
      .send({ name: `ToUpdate_${Date.now()}` });
    const res = await request(app)
      .put(`/categories/${created.body.id}`)
      .send({ name: `Updated_${Date.now()}` });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("name");
  });

  it("PUT /categories/:id - nome duplicado (400)", async () => {
    const a = await request(app)
      .post("/categories")
      .send({ name: `DupA_${Date.now()}` });
    const b = await request(app)
      .post("/categories")
      .send({ name: `DupB_${Date.now()}` });
    const res = await request(app)
      .put(`/categories/${b.body.id}`)
      .send({ name: a.body.name });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "Já existe uma categoria com esse nome"
    );
  });

  it("DELETE /categories/:id - com transações (400) e sem transações (204)", async () => {
    const c1 = await request(app)
      .post("/categories")
      .send({ name: `DelWithTx_${Date.now()}` });
    const u = await request(app)
      .post("/users/register")
      .send({
        name: "UserTx",
        email: `utx_${Date.now()}@ex.com`,
        password: "123456",
      });
    const l = await request(app).post("/users/login").send({
      email: u.body.email,
      password: "123456",
    });
    const tkn = l.body.token;
    await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${tkn}`)
      .send({
        categoryId: c1.body.id,
        tipo: "entrada",
        valor: 5,
        data: "2025-07-01",
      });

    const delFail = await request(app).delete(`/categories/${c1.body.id}`);
    expect(delFail.status).to.equal(400);
    expect(delFail.body).to.have.property(
      "message",
      "Não é possível excluir categoria com transações associadas"
    );

    const c2 = await request(app)
      .post("/categories")
      .send({ name: `DelNoTx_${Date.now()}` });
    const delOk = await request(app).delete(`/categories/${c2.body.id}`);
    expect(delOk.status).to.equal(204);
  });
});
