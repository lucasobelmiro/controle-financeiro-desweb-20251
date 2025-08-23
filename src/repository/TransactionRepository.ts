import { Transaction } from "../models/Transaction";
import { Op } from "sequelize";

export class TransactionRepository {
  async createTransaction(data: {
    userId: number;
    categoryId: number;
    tipo: "entrada" | "saida";
    valor: number;
    descricao?: string;
    data: Date;
  }) {
    return await Transaction.create({
      userId: data.userId,
      categoryId: data.categoryId,
      tipo: data.tipo,
      valor: data.valor,
      descricao: data.descricao ?? "",
      data: data.data,
    });
  }

  async getAllTransactions() {
    return await Transaction.findAll();
  }

  async getTransactionsByUser(
    userId: number,
    opts?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      sortBy?: "data" | "valor";
      order?: "ASC" | "DESC";
    }
  ) {
    const where: any = { userId };
    if (opts?.startDate || opts?.endDate) {
      where.data = {};
      if (opts.startDate) where.data[Op.gte] = opts.startDate;
      if (opts.endDate) where.data[Op.lte] = opts.endDate;
    }

    const sortBy = opts?.sortBy || "data";
    const order = opts?.order || "ASC";

    return Transaction.findAll({
      where,
      limit: opts?.limit,
      offset: opts?.offset,
      order: [[sortBy, order]],
    });
  }

  async getTransactionsByCategory(categoryId: number) {
    return await Transaction.findAll({ where: { categoryId } });
  }

  async updateTransaction(id: number, updates: Partial<Transaction>) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return null;
    return await transaction.update(updates);
  }

  async deleteTransaction(id: number) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return null;
    await transaction.destroy();
    return transaction;
  }

  async hasTransactionsByUser(userId: number): Promise<boolean> {
    const t = await Transaction.findOne({ where: { userId } });
    return !!t;
  }

  async getByDateRangeAndUser(start: Date, end: Date, userId: number) {
    return await Transaction.findAll({
      where: {
        userId,
        data: { [Op.gte]: start, [Op.lt]: end },
      },
      order: [
        ["data", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  async hasTransactionsByCategory(categoryId: number): Promise<boolean> {
    const count = await Transaction.count({ where: { categoryId } });
    return count > 0;
  }
}
