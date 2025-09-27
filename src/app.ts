import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import cors from "cors";

dotenv.config();

export const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/transactions", transactionRoutes);

export const ready = sequelize
  .sync({ force: process.env.NODE_ENV === "test" })
  .then(() => {
    console.log("Banco de dados conectado!");
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
    throw error;
  });
