import { Request, Response } from "express";
import { TransactionService } from "../services/transactionService";
import { AuthRequest } from "../middlewares/authMiddleware";

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const data = { ...req.body, userId: req.user.id };
      const transaction = await this.transactionService.createTransaction(data);
      return res.status(201).json(transaction);
    } catch (error: any) {
      return res
        .status(400)
        .json({ message: "Erro ao criar transação", error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    const transactions = await this.transactionService.getAllTransactions();
    return res.json(transactions);
  }

  async getByUser(req: AuthRequest, res: Response) {
    if (!req.user?.id)
      return res.status(401).json({ message: "Usuário não autenticado" });
    const transactions = await this.transactionService.getTransactionsByUser(
      Number(req.user.id)
    );
    return res.json(transactions);
  }

  async getByCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const transactions =
      await this.transactionService.getTransactionsByCategory(
        Number(categoryId)
      );
    return res.json(transactions);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const transaction = await this.transactionService.getTransactionById(
      Number(id)
    );
    if (!transaction)
      return res.status(404).json({ message: "Transação não encontrada" });
    return res.json(transaction);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updated = await this.transactionService.updateTransaction(
        Number(id),
        updates
      );
      if (!updated)
        return res.status(404).json({ message: "Transação não encontrada" });
      return res.json(updated);
    } catch (error: any) {
      return res
        .status(400)
        .json({ message: error.message || "Erro ao atualizar transação" });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = await this.transactionService.deleteTransaction(Number(id));
    if (!deleted)
      return res.status(404).json({ message: "Transação não encontrada" });
    return res.status(204).send();
  }

  async getExtrato(req: AuthRequest, res: Response) {
    try {
      const extrato = await this.transactionService.getExtratoByUser(
        req.user.id
      );
      return res.json(extrato);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Erro ao gerar extrato", error: error.message });
    }
  }

  async summary(req: AuthRequest, res: Response) {
    try {
      const month = String(req.query.month || "");
      if (!req.user?.id)
        return res.status(401).json({ message: "Usuário não autenticado" });
      const result = await this.transactionService.getMonthlySummary(
        month,
        req.user.id
      );
      return res.json(result);
    } catch (error: any) {
      if (String(error.message).includes("month")) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: "Erro ao obter resumo", error: error.message });
    }
  }

  async breakdown(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const { month } = req.query as { month?: string };
      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res
          .status(400)
          .json({ message: "Parâmetro month inválido. Use YYYY-MM." });
      }
      const result = await this.transactionService.getMonthlyBreakdown(
        month,
        req.user.id
      );
      return res.json({
        totalSaidas: result.totalSaidas,
        breakdown: result.items,
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: "Erro ao gerar breakdown", error: err.message });
    }
  }
}
