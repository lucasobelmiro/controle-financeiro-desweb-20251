import { Request, Response } from "express";
import { TransactionRepository } from "../repository/TransactionRepository";

const transactionRepo = new TransactionRepository();

export class TransactionController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const transaction = await transactionRepo.createTransaction(data);
      return res.status(201).json(transaction);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Erro ao criar transação", error });
    }
  }

  async getAll(req: Request, res: Response) {
    const transactions = await transactionRepo.getAllTransactions();
    return res.json(transactions);
  }

  async getByUser(req: Request, res: Response) {
    const { userId } = req.params;
    const transactions = await transactionRepo.getTransactionsByUser(
      Number(userId)
    );
    return res.json(transactions);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const transaction = await transactionRepo
      .getAllTransactions()
      .then((list) => list.find((t) => t.id === Number(id)));
    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    return res.json(transaction);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    const updated = await transactionRepo.updateTransaction(
      Number(id),
      updates
    );
    if (!updated) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    return res.json(updated);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = await transactionRepo.deleteTransaction(Number(id));
    if (!deleted) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    return res.status(204).send();
  }
}
