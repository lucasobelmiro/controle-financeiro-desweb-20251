type Props = {
  title: string;
  value: number;
  variant?: "in" | "out";
};

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SummaryCard({ title, value, variant }: Props) {
  const color =
    variant === "in" ? "#065f46" : variant === "out" ? "#991b1b" : "#111827";
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8, color: "#111827" }}>
        {title}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>
        {formatBRL(value)}
      </div>
    </div>
  );
}
