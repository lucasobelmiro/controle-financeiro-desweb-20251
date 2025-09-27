import { TransactionRepository } from "../repository/TransactionRepository";
import { CategoryRepository } from "../repository/CategoryRepository";

interface TransactionDTO {
  userId: number;
  categoryId: number;
  tipo: "entrada" | "saida";
  valor: number;
  descricao?: string;
  data: Date | string;
}

export class TransactionService {
  constructor(
    private transactionRepo: TransactionRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async createTransaction(data: TransactionDTO) {
    if (!data.userId) throw new Error("Usuário não informado");
    if (!data.categoryId) throw new Error("Categoria não informada");
    if (!data.tipo || !["entrada", "saida"].includes(data.tipo))
      throw new Error("Tipo inválido");
    if (
      data.valor === undefined ||
      data.valor === null ||
      isNaN(Number(data.valor))
    ) {
      throw new Error("Valor inválido");
    }
    const categoria = await this.categoryRepo.getCategoryByIdVisible(
      data.categoryId,
      data.userId
    );
    if (!categoria) throw new Error("Categoria não encontrada");

    return await this.transactionRepo.createTransaction({
      ...data,
      data: new Date(data.data),
    } as any);
  }

  async getAllTransactions() {
    return await this.transactionRepo.getAllTransactions();
  }

  async getTransactionById(id: number) {
    const all = await this.transactionRepo.getAllTransactions();
    return all.find((t) => t.id === id);
  }

  async getTransactionsByCategory(categoryId: number) {
    return await this.transactionRepo.getTransactionsByCategory(categoryId);
  }

  async updateTransaction(id: number, updates: Partial<TransactionDTO>) {
    if (updates.categoryId !== undefined) {
      const current = await this.getTransactionById(id);
      if (!current) throw new Error("Transação não encontrada");

      const cat = await this.categoryRepo.getCategoryByIdVisible(
        updates.categoryId,
        current.userId
      );
      if (!cat) throw new Error("Categoria não encontrada");
    }

    if (updates.valor !== undefined && isNaN(Number(updates.valor))) {
      throw new Error("Valor inválido");
    }
    return await this.transactionRepo.updateTransaction(id, updates as any);
  }

  async deleteTransaction(id: number) {
    return await this.transactionRepo.deleteTransaction(id);
  }

  async getTransactionsByUser(userId: number, opts?: any) {
    return this.transactionRepo.getTransactionsByUser(userId, opts);
  }

  async getExtratoByUser(userId: number) {
    const transactions = await this.transactionRepo.getTransactionsByUser(
      userId
    );
    transactions.sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    let saldoAcumulado = 0;
    return transactions.map((t) => {
      saldoAcumulado += t.tipo === "entrada" ? t.valor : -t.valor;
      return {
        data: t.data,
        descricao: t.descricao,
        valor: (t.tipo === "entrada" ? "+" : "-") + Number(t.valor).toFixed(2),
        saldoAcumulado: saldoAcumulado.toFixed(2),
      };
    });
  }
  async getMonthlySummary(month: string, userId: number) {
    const range = this.buildMonthRange(month);
    if (!range) throw new Error("Parâmetro 'month' inválido. Use YYYY-MM.");

    const txs = await this.transactionRepo.getByDateRangeAndUser(
      range.start,
      range.end,
      userId
    );

    let entradas = 0;
    let saidas = 0;
    const mapSaidasPorCategoria = new Map<number, number>();

    for (const t of txs) {
      const v = Number(t.valor ?? 0);
      if (t.tipo === "entrada") entradas += v;
      if (t.tipo === "saida") {
        saidas += v;
        mapSaidasPorCategoria.set(
          t.categoryId,
          (mapSaidasPorCategoria.get(t.categoryId) || 0) + v
        );
      }
    }
    const topCategorias = Array.from(mapSaidasPorCategoria.entries())
      .map(([categoryId, total]) => ({ categoryId, total: Number(total) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    const saldo = entradas - saidas;
    return { periodo: month, entradas, saidas, saldo, topCategorias };
  }

  private buildMonthRange(month: string) {
    if (!/^\d{4}-\d{2}$/.test(month)) return null;
    const [y, m] = month.split("-").map((v) => Number(v));
    if (m < 1 || m > 12) return null;

    const start = new Date(Date.UTC(y, m - 1, 1));
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? y + 1 : y;
    const end = new Date(Date.UTC(nextYear, nextMonth - 1, 1));
    return { start, end };
  }

  async getMonthlyBreakdown(month: string, userId: number) {
    const m = String(month || "");
    if (!/^\d{4}-\d{2}$/.test(m)) {
      throw new Error("Parâmetro month inválido. Use YYYY-MM.");
    }

    const all = await this.transactionRepo.getTransactionsByUser(userId);
    const inMonth = all.filter((t: any) => String(t.data).startsWith(m));
    const saidas = inMonth.filter((t: any) => t.tipo === "saida");

    const totalsByCat: Record<number, number> = {};
    for (const t of saidas) {
      const catId = Number(t.categoryId);
      const val = Number(t.valor) || 0;
      totalsByCat[catId] = (totalsByCat[catId] ?? 0) + val;
    }

    const totalSaidas = Object.values(totalsByCat).reduce((a, b) => a + b, 0);

    const items: Array<{
      categoryId: number;
      name: string;
      total: number;
      percent: number;
    }> = [];
    for (const [catIdStr, total] of Object.entries(totalsByCat)) {
      const catId = Number(catIdStr);

      const cat = await this.categoryRepo.getCategoryByIdVisible(catId, userId);

      const pct = totalSaidas > 0 ? (Number(total) / totalSaidas) * 100 : 0;
      items.push({
        categoryId: catId,
        name: cat?.name ?? `Categoria ${catId}`,
        total: Number(Number(total).toFixed(2)),
        percent: Number(pct.toFixed(2)),
      });
    }

    if (totalSaidas > 0 && items.length > 0) {
      const sumPct = items.reduce((acc, i) => acc + i.percent, 0);
      const diff = Number((100 - sumPct).toFixed(2));
      if (Math.abs(diff) >= 0.01) {
        const idx = items.reduce(
          (imax, it, i, arr) => (it.total > arr[imax].total ? i : imax),
          0
        );
        items[idx].percent = Number((items[idx].percent + diff).toFixed(2));
      }
    }

    return {
      totalSaidas: Number(totalSaidas.toFixed(2)),
      items,
    };
  }
}
