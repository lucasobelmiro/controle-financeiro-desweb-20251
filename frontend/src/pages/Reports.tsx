import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import {
  getUserTransactionsByMonth,
  type TransactionDTO,
} from "../services/transactions";

function toBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function todayYYYYMM() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

export default function Reports() {
  const { user } = useAuth();
  const [month, setMonth] = useState<string>(todayYYYYMM());
  const [items, setItems] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserTransactionsByMonth(user.id, month, {
          sortBy: "data",
          order: "ASC",
        });
        if (alive) setItems(data ?? []);
      } catch (err: any) {
        console.error(err);
        if (alive)
          setError(
            err?.response?.data?.message ||
              "Falha ao carregar as transações do mês."
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id, month]);

  const baseList = useMemo(() => {
    const list = (items || [])
      .filter((t) => String(t.data).startsWith(month))
      .sort((a, b) => a.data.localeCompare(b.data));
    return list;
  }, [items, month]);

  const { resumo, linhas } = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    let acumulado = 0;

    const linhasCalc = baseList.map((t) => {
      const v = Number(t.valor) || 0;
      const valor = t.tipo === "entrada" ? Math.abs(v) : -Math.abs(v);

      if (valor >= 0) entradas += valor;
      else saidas += Math.abs(valor);

      acumulado += valor;

      return {
        id: t.id,
        data: t.data,
        descricao: t.descricao || "",
        valor,
        saldoApos: acumulado,
      };
    });

    return {
      resumo: {
        entradas,
        saidas,
        saldo: entradas - saidas,
      },
      linhas: linhasCalc,
    };
  }, [baseList]);

  return (
    <MainLayout
      title="Extrato"
      actions={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 600, color: "#374151" }}>Mês:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={styles.monthInput}
          />
        </div>
      }
    >
      <div style={styles.grid}>
        {/* Resumo do mês */}
        <section style={styles.summaryCard}>
          <h3 style={styles.cardTitle}>Resumo do mês</h3>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Entradas:</span>
              <strong style={{ color: "#065f46" }}>
                {toBRL(resumo.entradas)}
              </strong>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Saídas:</span>
              <strong style={{ color: "#991b1b" }}>
                {toBRL(resumo.saidas)}
              </strong>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Saldo:</span>
              <strong
                style={{ color: resumo.saldo >= 0 ? "#065f46" : "#991b1b" }}
              >
                {toBRL(resumo.saldo)}
              </strong>
            </div>
          </div>
        </section>

        {/* Tabela */}
        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>Data</div>
            <div>Descrição</div>
            <div style={{ textAlign: "right" }}>Valor</div>
            <div style={{ textAlign: "right" }}>Saldo</div>
          </div>

          {loading && <div style={styles.tableRowMsg}>Carregando…</div>}

          {error && !loading && (
            <div style={{ ...styles.tableRowMsg, color: "#b91c1c" }}>
              {error}
            </div>
          )}

          {!loading && !error && linhas.length === 0 && (
            <div style={styles.tableRowMsg}>Nenhuma transação neste mês.</div>
          )}

          {!loading &&
            !error &&
            linhas.map((l, idx) => (
              <div
                key={l.id}
                style={{
                  ...styles.tableRow,
                  background: idx % 2 ? "#fafafa" : "#fff",
                }}
              >
                <div>
                  {new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
                <div>{l.descricao}</div>
                <div
                  style={{
                    textAlign: "right",
                    color: l.valor >= 0 ? "#065f46" : "#991b1b",
                  }}
                >
                  {l.valor >= 0
                    ? `+ ${toBRL(l.valor)}`
                    : `- ${toBRL(Math.abs(l.valor))}`}
                </div>
                <div style={{ textAlign: "right", fontWeight: 700 }}>
                  {toBRL(l.saldoApos)}
                </div>
              </div>
            ))}
        </section>
      </div>
    </MainLayout>
  );
}

/* ================== estilos ================== */
const styles: Record<string, React.CSSProperties> = {
  monthInput: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "8px 10px",
    background: "#fff",
    color: "#111827",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 16,
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 16,
    height: "fit-content",
  },
  cardTitle: {
    fontWeight: 800,
    color: "#111827",
    marginBottom: 10,
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: "#374151",
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 160px 160px",
    background: "#f3f4f6",
    padding: "12px 16px",
    fontWeight: 700,
    color: "#111827",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 160px 160px",
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    alignItems: "center",
  },
  tableRowMsg: {
    padding: 16,
    color: "#6b7280",
  },
};
