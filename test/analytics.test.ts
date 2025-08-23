import { expect } from "chai";
import request from "supertest";
import { app } from "../src/app";
import { registerAndLogin } from "./auth.helper";

describe("Analytics (summary & breakdown)", () => {
  let token = "";
  let categoryFood = 0;
  let categoryTransport = 0;

  before(async () => {
    const auth = await registerAndLogin();
    token = auth.token;

    const c1 = await request(app)
      .post("/categories")
      .send({ name: `Alimentação_${Date.now()}` });
    const c2 = await request(app)
      .post("/categories")
      .send({ name: `Transporte_${Date.now()}` });
    categoryFood = c1.body.id;
    categoryTransport = c2.body.id;

    await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: categoryFood,
        tipo: "entrada",
        valor: 3000,
        data: "2025-08-01",
        descricao: "Salário",
      });
    await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: categoryFood,
        tipo: "entrada",
        valor: 200,
        data: "2025-08-05",
        descricao: "Freela",
      });

    await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: categoryFood,
        tipo: "saida",
        valor: 450,
        data: "2025-08-10",
        descricao: "Mercado",
      });
    await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: categoryTransport,
        tipo: "saida",
        valor: 150,
        data: "2025-08-15",
        descricao: "Uber",
      });
  });

  it("GET /transactions/summary?month=2025-08 - deve trazer totais e saldo (200)", async () => {
    const res = await request(app)
      .get("/transactions/summary")
      .set("Authorization", `Bearer ${token}`)
      .query({ month: "2025-08" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("entradas", 3200);
    expect(res.body).to.have.property("saidas", 600);
    expect(res.body).to.have.property("saldo", 2600);
    expect(res.body).to.have.property("periodo");
    expect(res.body).to.have.property("topCategorias").that.is.an("array");
  });

  it("GET /transactions/breakdown?month=2025-08 - deve trazer percentual por categoria (200)", async () => {
    const res = await request(app)
      .get("/transactions/breakdown")
      .set("Authorization", `Bearer ${token}`)
      .query({ month: "2025-08" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("totalSaidas", 600);
    expect(res.body).to.have.property("breakdown").that.is.an("array");

    const sum = res.body.breakdown.reduce(
      (acc: number, b: any) => acc + b.percentual,
      0
    );
    expect(sum).to.be.within(99.99, 100.01);
  });

  it("GET /transactions/summary sem month válido retorna 400", async () => {
    const res = await request(app)
      .get("/transactions/summary")
      .set("Authorization", `Bearer ${token}`)
      .query({ month: "2025-8" });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });
});
