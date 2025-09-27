import * as React from "react";
import type { TransactionDTO } from "../../services/transactions";
import type { CategoryDTO } from "../../services/categories";

type Props = {
  txs: TransactionDTO[];
  loading?: boolean;
  categories?: CategoryDTO[];
};

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatDate(s: string) {
  try {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString("pt-BR");
  } catch {
    return s;
  }
}

export default function RecentTransactions({
  txs,
  loading,
  categories,
}: Props) {
  const catNameById = React.useMemo(() => {
    const m: Record<number, string> = {};
    (categories ?? []).forEach((c) => (m[c.id] = c.name));
    return m;
  }, [categories]);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "140px 180px 1fr 140px",
          background: "#f3f4f6",
          padding: "12px 16px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        <div>Data</div>
        <div>Descrição</div>
        <div>Categoria</div>
        <div style={{ textAlign: "right" }}>Valor</div>
      </div>

      {loading && (
        <div style={{ padding: 16, color: "#6b7280" }}>Carregando…</div>
      )}

      {!loading && txs.length === 0 && (
        <div style={{ padding: 16, color: "#6b7280" }}>
          Nenhuma transação encontrada.
        </div>
      )}

      {!loading &&
        txs.map((t, idx) => (
          <div
            key={t.id}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 180px 1fr 120px",
              padding: "12px 16px",
              borderTop: "1px solid #f1f5f9",
              background: idx % 2 ? "#fafafa" : "#fff",
              alignItems: "center",
            }}
          >
            <div>{formatDate(t.data)}</div>
            <div>{t.descricao || "-"}</div>
            <div>{catNameById[t.categoryId] ?? String(t.categoryId)}</div>
            <div
              style={{
                textAlign: "right",
                color: t.tipo === "entrada" ? "#065f46" : "#991b1b",
                fontWeight: 700,
              }}
            >
              {t.tipo === "saida" ? "-" : ""}
              {formatBRL(t.valor)}
            </div>
          </div>
        ))}
    </div>
  );
}
