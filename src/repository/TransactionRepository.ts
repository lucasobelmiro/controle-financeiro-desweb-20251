import { Transaction } from "../models/Transaction";

export class TransactionRepository {
  // Cria uma nova transação
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

  // Retorna todas as transações
  async getAllTransactions() {
    return await Transaction.findAll();
  }

  // Retorna transações de um usuário
  async getTransactionsByUser(userId: number) {
    return await Transaction.findAll({
      where: { userId },
    });
  }

  // Retorna transações de uma categoria
  async getTransactionsByCategory(categoryId: number) {
    return await Transaction.findAll({
      where: { categoryId },
    });
  }

  // Atualiza uma transação
  async updateTransaction(id: number, updates: Partial<Transaction>) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return null;
    return await transaction.update(updates);
  }

  // Deleta uma transação
  async deleteTransaction(id: number) {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return null;
    await transaction.destroy();
    return transaction;
  }
}
