type Item = {
  name: string;
  total: number;
  percent: number;
  categoryId: number;
};

type Props = {
  items: Item[];
  loading?: boolean;
};

function formatPct(n: number) {
  return `${Math.round(n)}%`;
}

export default function BreakdownByCategory({ items, loading }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 16,
        minHeight: 220,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10, color: "#111827" }}>
        Distribuição de saídas por categoria
      </div>

      {loading && <div style={{ color: "#6b7280" }}>Carregando…</div>}

      {!loading && items.length === 0 && (
        <div style={{ color: "#6b7280" }}>Sem dados neste mês.</div>
      )}

      {!loading &&
        items.map((it) => (
          <div key={it.categoryId} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              <span>{it.name}</span>
              <span style={{ color: "#111827" }}>{formatPct(it.percent)}</span>
            </div>
            <div
              style={{
                height: 10,
                background: "#f3f4f6",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, it.percent))}%`,
                  height: "100%",
                  background: "#4f46e5",
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
