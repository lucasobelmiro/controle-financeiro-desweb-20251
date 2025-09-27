import { useEffect, useMemo, useState } from "react";
import { getMonthlySummary } from "../../services/transactions";

type Point = { month: string; saldo: number };
type Props = { month: string };

function prevMonthsList(baseYYYYMM: string, n = 6): string[] {
  const [y, m] = baseYYYYMM.split("-").map(Number);
  const base = new Date(Date.UTC(y, (m || 1) - 1, 1));
  const arr: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setUTCMonth(base.getUTCMonth() - i);
    arr.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    );
  }
  return arr;
}

export default function BalanceLineChart({ month }: Props) {
  const months = useMemo(() => prevMonthsList(month, 6), [month]);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const results = await Promise.all(
          months.map((m) => getMonthlySummary(m))
        );
        if (!alive) return;
        const pts: Point[] = results.map((s, i) => ({
          month: months[i],
          saldo: s.saldo,
        }));
        setPoints(pts);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [months]);

  const W = 600;
  const H = 220;
  const P = 24;

  const min = Math.min(...(points.map((p) => p.saldo) as number[]), 0);
  const max = Math.max(...(points.map((p) => p.saldo) as number[]), 0);
  const range = Math.max(1, max - min);

  function x(i: number) {
    if (points.length <= 1) return P;
    return P + (i * (W - P * 2)) / (points.length - 1);
  }
  function y(v: number) {
    return H - P - ((v - min) * (H - P * 2)) / range;
  }

  const poly = points.map((p, i) => `${x(i)},${y(p.saldo)}`).join(" ");

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 12,
        minHeight: 220,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          margin: "4px 8px 10px 8px",
          color: "#111827",
        }}
      >
        Evolução do saldo (últimos 6 meses)
      </div>

      {loading && (
        <div style={{ padding: 12, color: "#6b7280" }}>Carregando…</div>
      )}

      {!loading && points.length === 0 && (
        <div style={{ padding: 12, color: "#6b7280" }}>Sem dados.</div>
      )}

      {!loading && points.length > 0 && (
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Evolução do saldo"
        >
          {/* grid simples */}
          <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#e5e7eb" />
          <polyline
            fill="none"
            stroke="#4f46e5"
            strokeWidth={2}
            points={poly}
          />
          {points.map((p, i) => (
            <circle
              key={p.month}
              cx={x(i)}
              cy={y(p.saldo)}
              r={3}
              fill="#4f46e5"
            />
          ))}
        </svg>
      )}
    </div>
  );
}
