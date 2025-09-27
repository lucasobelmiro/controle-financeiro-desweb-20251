import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import {
  getMonthlySummary,
  getMonthlyBreakdown,
  getUserTransactionsByMonth,
  type TxType,
  type TransactionDTO,
} from "../services/transactions";
import { getCategories, type CategoryDTO } from "../services/categories";

import FiltersBar from "../components/Dashboard/FiltersBar";
import SummaryCard from "../components/Dashboard/SummaryCard";
import BreakdownByCategory from "../components/Dashboard/BreakdownByCategory";
import RecentTransactions from "../components/Dashboard/RecentTransactions";
import BalanceLineChart from "../components/Dashboard/BalanceLineChart";

function currentMonthYYYYMM() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [month, setMonth] = useState<string>(currentMonthYYYYMM());
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | TxType>("");

  const [summary, setSummary] = useState<{
    entradas: number;
    saidas: number;
    saldo: number;
  }>({ entradas: 0, saidas: 0, saldo: 0 });

  const [breakdown, setBreakdown] = useState<
    Array<{ name: string; total: number; percent: number; categoryId: number }>
  >([]);

  const [txs, setTxs] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await getCategories();
        setCategories(list ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [s, b, list] = await Promise.all([
          getMonthlySummary(month),
          getMonthlyBreakdown(month),
          getUserTransactionsByMonth(user.id, month, {
            sortBy: "data",
            order: "DESC",
          }),
        ]);
        if (!alive) return;
        setSummary({ entradas: s.entradas, saidas: s.saidas, saldo: s.saldo });
        setBreakdown(b);
        setTxs(list || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id, month]);

  const filteredTxs = useMemo(() => {
    let list = txs.slice();
    if (categoryId)
      list = list.filter((t) => t.categoryId === Number(categoryId));
    if (type) list = list.filter((t) => t.tipo === type);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((t) => (t.descricao || "").toLowerCase().includes(s));
    }
    return list;
  }, [txs, categoryId, type, search]);

  const monthOnlyTxs = useMemo(() => {
    return filteredTxs.filter((t) => String(t.data).startsWith(month));
  }, [filteredTxs, month]);

  return (
    <MainLayout
      title="Dashboard Financeiro"
      actions={
        <button
          onClick={() => navigate("/transactions/new")}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Nova Transação
        </button>
      }
    >
      <FiltersBar
        month={month}
        onMonthChange={setMonth}
        categories={categories}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        type={type}
        onTypeChange={setType}
        search={search}
        onSearchChange={setSearch}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <SummaryCard title="Entradas" value={summary.entradas} variant="in" />
        <SummaryCard title="Saídas" value={summary.saidas} variant="out" />
        <SummaryCard title="Saldo do mês" value={summary.saldo} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 12,
          marginBottom: 12,
          alignItems: "stretch",
        }}
      >
        <BalanceLineChart month={month} />
        <BreakdownByCategory items={breakdown} loading={loading} />
      </div>
      <RecentTransactions
        txs={monthOnlyTxs.slice(0, 10)}
        loading={loading}
        categories={categories}
      />{" "}
    </MainLayout>
  );
}
