import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/Layout/MainLayout";
import {
  getUserTransactionsByMonth,
  deleteTransaction,
  type TransactionDTO,
  type TxType,
} from "../../services/transactions";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

type Category = { id: number; name: string };

export default function TransactionsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [typeFilter, setTypeFilter] = useState<"all" | TxType>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tx, setTx] = useState<TransactionDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function load() {
    if (!user) return;
    try {
      setLoading(true);
      const [txsResp, catsResp] = await Promise.all([
        getUserTransactionsByMonth(user.id, month, {
          sortBy: "data",
          order: "ASC",
        }),
        api.get<Category[]>("/categories"),
      ]);
      setTx(txsResp);
      setCategories(catsResp.data);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user?.id, month]);

  const categoriesMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    let list = tx.slice();

    list = list.filter((t) => String(t.data).startsWith(month));

    if (typeFilter !== "all") {
      list = list.filter((t) => t.tipo === typeFilter);
    }

    if (categoryFilter !== "all") {
      list = list.filter((t) => t.categoryId === Number(categoryFilter));
    }

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((t) => {
        const desc = (t.descricao || "").toLowerCase();
        const catName = (categoriesMap.get(t.categoryId) || "").toLowerCase();
        return desc.includes(s) || catName.includes(s);
      });
    }

    list.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));

    return list;
  }, [tx, month, typeFilter, categoryFilter, search, categoriesMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleDelete(id: number) {
    if (!confirm("Excluir esta transação?")) return;
    await deleteTransaction(id);
    await load();
  }

  return (
    <MainLayout
      title="Transações"
      actions={
        <button
          onClick={() => navigate("/transactions/new")}
          style={styles.primaryBtn}
        >
          + Nova Transação
        </button>
      }
    >
      <div style={styles.filtersBar}>
        <div style={styles.filtersGrid}>
          <div>
            <label style={styles.label}>Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              style={styles.input}
            >
              <option value="all">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              style={styles.input}
            >
              <option value="all">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Mês</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Buscar descrição…</label>
            <input
              type="text"
              placeholder="Ex.: mercado, aluguel…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{ padding: 16 }}>Carregando…</div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Descrição</th>
                  <th style={styles.th}>Categoria</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.thRight}>Valor</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ padding: 16, textAlign: "center" }}
                    >
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((t) => (
                    <tr key={t.id}>
                      <td style={styles.td}>{t.data}</td>
                      <td style={styles.td}>{t.descricao}</td>
                      <td style={styles.td}>
                        {categoriesMap.get(t.categoryId) ?? `#${t.categoryId}`}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 999,
                            background:
                              t.tipo === "entrada" ? "#E8F7EE" : "#FDECEC",
                            color: t.tipo === "entrada" ? "#137B3D" : "#A11A1A",
                            fontSize: 12,
                          }}
                        >
                          {t.tipo}
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.tdRight,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {t.tipo === "entrada" ? "+ " : "- "}
                        {Number(t.valor).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => navigate(`/transactions/${t.id}/edit`)}
                          style={styles.linkBtn}
                        >
                          Editar
                        </button>
                        <span style={{ margin: "0 6px", opacity: 0.5 }}>|</span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          style={styles.linkBtnDanger}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {filtered.length > pageSize && (
              <div style={styles.pagination}>
                <button
                  style={styles.pagerBtn}
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ◀
                </button>
                <span style={{ margin: "0 8px" }}>
                  Página <strong>{page}</strong> de{" "}
                  <strong>{totalPages}</strong>
                </span>
                <button
                  style={styles.pagerBtn}
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  primaryBtn: {
    border: "1px solid #bdbdbd",
    background: "#e0e0e0",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  filtersBar: {
    marginBottom: 12,
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "180px 240px 160px 1fr",
    gap: 12,
    alignItems: "end",
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: 8,
    outline: "none",
  },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    textAlign: "left",
    fontWeight: 600,
    fontSize: 14,
    padding: "12px 14px",
    borderBottom: "1px solid #eee",
    background: "#fafafa",
  },
  thRight: {
    textAlign: "right",
    fontWeight: 600,
    fontSize: 14,
    padding: "12px 14px",
    borderBottom: "1px solid #eee",
    background: "#fafafa",
  },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #f2f2f2",
    fontSize: 14,
  },
  tdRight: {
    padding: "10px 14px",
    borderBottom: "1px solid #f2f2f2",
    fontSize: 14,
    textAlign: "right",
  },
  linkBtn: {
    border: "none",
    background: "transparent",
    color: "#0b71d9",
    cursor: "pointer",
    padding: 0,
  },
  linkBtnDanger: {
    border: "none",
    background: "transparent",
    color: "#c62828",
    cursor: "pointer",
    padding: 0,
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 12,
    gap: 4,
  },
  pagerBtn: {
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 6,
    padding: "6px 10px",
    cursor: "pointer",
  },
};
