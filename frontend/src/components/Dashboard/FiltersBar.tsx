import type { CategoryDTO } from "../../services/categories";
import type { TxType } from "../../services/transactions";

type Props = {
  month: string;
  onMonthChange: (m: string) => void;

  categories: CategoryDTO[];
  categoryId: number | "";
  onCategoryChange: (v: number | "") => void;

  type: "" | TxType;
  onTypeChange: (v: "" | TxType) => void;

  search: string;
  onSearchChange: (v: string) => void;
};

export default function FiltersBar({
  month,
  onMonthChange,
  categories,
  categoryId,
  onCategoryChange,
  type,
  onTypeChange,
  search,
  onSearchChange,
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "160px 220px 180px 1fr",
        gap: 10,
        marginBottom: 12,
        alignItems: "center",
      }}
    >
      {/* Mês */}
      <input
        type="month"
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        style={input}
        title="Mês"
      />

      {/* Categoria */}
      <select
        value={categoryId === "" ? "" : Number(categoryId)}
        onChange={(e) =>
          onCategoryChange(e.target.value ? Number(e.target.value) : "")
        }
        style={input}
        title="Categoria"
      >
        <option value="">Categoria: Todas</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Tipo */}
      <select
        value={type}
        onChange={(e) => onTypeChange((e.target.value || "") as any)}
        style={input}
      >
        <option value="">Tipo: Todos</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>

      {/* Busca por descrição */}
      <input
        type="text"
        placeholder="Buscar descrição…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={input}
      />
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "10px 12px",
  outline: "none",
  fontSize: 14,
  color: "#111827",
  background: "#fff",
};
