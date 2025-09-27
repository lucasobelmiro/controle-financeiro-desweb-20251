import { api } from "./api";

export type TxType = "entrada" | "saida";

export type MonthlySummary = {
  periodo: string;
  entradas: number;
  saidas: number;
  saldo: number;
  topCategorias: Array<{ categoryId: number; total: number }>;
};

export type BreakdownResp = {
  totalSaidas: number;
  items: Array<{
    categoryId: number;
    name: string;
    total: number;
    percent: number;
  }>;
};

export async function getMonthlySummary(month: string) {
  const { data } = await api.get<MonthlySummary>("/transactions/summary", {
    params: { month },
  });
  return data;
}

export async function getMonthlyBreakdown(month: string) {
  const { data } = await api.get("/transactions/breakdown", {
    params: { month },
  });

  const items = Array.isArray(data) ? data : data.items ?? data.breakdown ?? [];

  return items.map((i: any) => ({
    categoryId: Number(i.categoryId),
    name: String(i.name),
    total: Number(i.total),
    percent: Number(i.percent),
  }));
}

export type TransactionDTO = {
  id: number;
  userId: number;
  categoryId: number;
  valor: number;
  descricao: string;
  tipo: TxType;
  data: string;
};

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

export async function getUserTransactions(userId: number) {
  const { data } = await api.get<TransactionDTO[]>(
    `/transactions/user/${userId}`
  );
  return data;
}

export async function getUserTransactionsByMonth(
  userId: number,
  month: string,
  opts?: {
    page?: number;
    pageSize?: number;
    sortBy?: "data" | "valor";
    order?: "ASC" | "DESC";
  }
) {
  const { startDate, endDate } = monthRange(month);
  const params: Record<string, string> = { startDate, endDate };
  if (opts?.page) params.page = String(opts.page);
  if (opts?.pageSize) params.pageSize = String(opts.pageSize);
  if (opts?.sortBy) params.sortBy = opts.sortBy;
  if (opts?.order) params.order = opts.order;

  const { data } = await api.get<TransactionDTO[]>(
    `/transactions/user/${userId}`,
    { params }
  );
  return data;
}

export type CreateTxInput = {
  userId: number;
  categoryId: number;
  tipo: "entrada" | "saida";
  valor: number;
  descricao: string;
  data: string;
};

export async function createTransaction(payload: CreateTxInput) {
  const { data } = await api.post("/transactions", payload);
  return data;
}

export type CategoryDTO = { id: number; name: string };

export async function getCategories() {
  const { data } = await api.get<CategoryDTO[]>("/categories");
  return data;
}

export async function deleteTransaction(id: number) {
  await api.delete(`/transactions/${id}`);
}

export async function getTransactionById(id: number) {
  const { data } = await api.get<TransactionDTO>(`/transactions/${id}`);
  return data;
}

export async function updateTransaction(id: number, payload: CreateTxInput) {
  const { data } = await api.put<TransactionDTO>(
    `/transactions/${id}`,
    payload
  );
  return data;
}
