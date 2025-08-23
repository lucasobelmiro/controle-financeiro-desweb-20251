import { expect } from "chai";
import request from "supertest";
import { app } from "../src/app";

describe("Integrações", () => {
  it("Usuário + transações associadas - sucesso (201)", async () => {
    const email = `int_${Date.now()}@ex.com`;
    const user = await request(app).post("/users/register").send({
      name: "IntUser",
      email,
      password: "123456",
    });
    const login = await request(app).post("/users/login").send({
      email,
      password: "123456",
    });
    const token = login.body.token;

    const cat = await request(app)
      .post("/categories")
      .send({
        name: `IntCat_${Date.now()}`,
      });

    const tx = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: cat.body.id,
        tipo: "entrada",
        valor: 99.9,
        data: "2025-07-01",
      });

    expect(tx.status).to.equal(201);
    expect(tx.body).to.have.property("userId");
    expect(tx.body).to.have.property("categoryId", cat.body.id);
  });

  it("Criar categoria e criar transação - sucesso (201)", async () => {
    const email = `int2_${Date.now()}@ex.com`;
    await request(app).post("/users/register").send({
      name: "IntUser2",
      email,
      password: "123456",
    });
    const login = await request(app).post("/users/login").send({
      email,
      password: "123456",
    });
    const token = login.body.token;

    const cat = await request(app)
      .post("/categories")
      .send({
        name: `IntCat2_${Date.now()}`,
      });

    const tx = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: cat.body.id,
        tipo: "saida",
        valor: 20,
        data: "2025-07-01",
      });

    expect(tx.status).to.equal(201);
    expect(tx.body).to.have.property("categoryId", cat.body.id);
  });

  it("Excluir categoria com transações - falha (400)", async () => {
    const email = `int3_${Date.now()}@ex.com`;
    await request(app).post("/users/register").send({
      name: "IntUser3",
      email,
      password: "123456",
    });
    const login = await request(app).post("/users/login").send({
      email,
      password: "123456",
    });
    const token = login.body.token;

    const cat = await request(app)
      .post("/categories")
      .send({
        name: `IntCat3_${Date.now()}`,
      });

    await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: cat.body.id,
        tipo: "entrada",
        valor: 10,
        data: "2025-07-01",
      });

    const del = await request(app).delete(`/categories/${cat.body.id}`);
    expect(del.status).to.equal(400);
    expect(del.body).to.have.property(
      "message",
      "Não é possível excluir categoria com transações associadas"
    );
  });
});
