import { expect } from "chai";
import request from "supertest";
import { app } from "../src/app";
import { registerAndLogin } from "./auth.helper";

describe("Transaction API", () => {
  let token = "";
  let categoryId = 0;
  let createdTxId = 0;

  before(async () => {
    const auth = await registerAndLogin();
    token = auth.token;
    const cat = await request(app)
      .post("/categories")
      .send({ name: `Geral_${Date.now()}` });
    categoryId = cat.body.id;
  });

  it("POST /transactions - cria entrada (201)", async () => {
    const res = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId,
        tipo: "entrada",
        valor: 100.5,
        descricao: "Salário teste",
        data: "2025-07-01",
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("tipo", "entrada");
    createdTxId = res.body.id;
  });

  it("POST /transactions - cria saída (201)", async () => {
    const res = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId,
        tipo: "saida",
        valor: 75.25,
        descricao: "Compra teste",
        data: "2025-07-02",
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("tipo", "saida");
  });

  it("POST /transactions - categoria inexistente (400)", async () => {
    const res = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: 999999,
        tipo: "saida",
        valor: 50,
        data: "2025-07-02",
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Erro ao criar transação");
    expect(res.body).to.have.property("error", "Categoria não encontrada");
  });

  it("POST /transactions - valor inválido (400)", async () => {
    const res = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId,
        tipo: "entrada",
        valor: "abc",
        data: "2025-07-03",
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Erro ao criar transação");
  });

  it("GET /transactions/:id - existente (200)", async () => {
    const res = await request(app)
      .get(`/transactions/${createdTxId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("id", createdTxId);
  });

  it("GET /transactions/:id - inexistente (404)", async () => {
    const res = await request(app)
      .get(`/transactions/999999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("message", "Transação não encontrada");
  });

  it("PUT /transactions/:id - sucesso (200)", async () => {
    const res = await request(app)
      .put(`/transactions/${createdTxId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ descricao: "Compra teste atualizada" });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("descricao", "Compra teste atualizada");
  });

  it("PUT /transactions/:id - categoria inexistente (400)", async () => {
    const res = await request(app)
      .put(`/transactions/${createdTxId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: 999999 });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Categoria não encontrada");
  });

  it("GET /transactions/user/:userId - lista do usuário (200)", async () => {
    const res = await request(app)
      .get(`/transactions/user/0`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("GET /transactions/category/:categoryId - lista por categoria (200)", async () => {
    const res = await request(app)
      .get(`/transactions/category/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  it("DELETE /transactions/:id - sucesso (204) e 404 depois", async () => {
    const del = await request(app)
      .delete(`/transactions/${createdTxId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).to.equal(204);

    const again = await request(app)
      .delete(`/transactions/${createdTxId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(again.status).to.equal(404);
    expect(again.body).to.have.property("message", "Transação não encontrada");
  });

  it("GET /transactions/extrato/:userId - retorna extrato (200)", async () => {
    const res = await request(app)
      .get("/transactions/extrato/1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });
});
