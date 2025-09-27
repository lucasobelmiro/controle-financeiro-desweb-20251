import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createTransaction,
  updateTransaction,
  getTransactionById,
  getCategories,
  type CreateTxInput,
  type CategoryDTO,
} from "../../services/transactions";

type Tipo = "entrada" | "saida";

export default function TransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();

  const [tipo, setTipo] = useState<Tipo>("entrada");
  const [data, setData] = useState<string>(() => {
    const dt = new Date();
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [categoria, setCategoria] = useState<number | "">("");
  const [valor, setValor] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");

  const [categorias, setCategorias] = useState<CategoryDTO[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(isEdit);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cats = await getCategories();
        if (alive) setCategorias(cats || []);
      } catch (err) {
        console.error("Falha ao listar categorias:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const tx = await getTransactionById(Number(id));
        setTipo(tx.tipo);
        setData(tx.data);
        setCategoria(tx.categoryId);
        setDescricao(tx.descricao ?? "");
        setValor(String(tx.valor).replace(".", ","));
        if (!alive || !tx) return;

        setTipo(tx.tipo);
        setData(tx.data);
        setCategoria(tx.categoryId);
        setDescricao(tx.descricao ?? "");
        setValor(String(tx.valor).replace(".", ","));
      } catch (err) {
        console.error(err);
        alert("Não foi possível carregar a transação.");
        navigate("/transactions", { replace: true });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, isEdit, navigate]);

  const canSubmit = useMemo(() => {
    if (!user?.id) return false;
    if (!data) return false;
    if (!categoria) return false;
    const v = Number(String(valor).replace(/\./g, "").replace(",", "."));
    if (!v || Number.isNaN(v) || v <= 0) return false;
    return true;
  }, [user?.id, data, categoria, valor]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSubmitting(true);

      const payload: CreateTxInput = {
        userId: user.id,
        categoryId: Number(categoria),
        valor: Math.abs(
          Number(String(valor).replace(/\./g, "").replace(",", "."))
        ),
        descricao: (descricao || "").trim(),
        tipo,
        data,
      };

      if (isEdit) {
        await updateTransaction(Number(id), payload);
        alert("Transação atualizada com sucesso!");
      } else {
        await createTransaction(payload);
        alert("Transação salva com sucesso!");
      }

      navigate("/transactions", { replace: true });
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Erro ao salvar a transação. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/transactions");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: 28,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 18,
            fontSize: 22,
            fontWeight: 800,
            color: "#111827",
          }}
        >
          {isEdit ? "Editar Transação" : "Adicionar Transação"}
        </h2>

        {/* Toggle tipo */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => setTipo("entrada")}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: tipo === "entrada" ? "#eef2ff" : "#fff",
              color: tipo === "entrada" ? "#4f46e5" : "#374151",
              fontWeight: 700,
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setTipo("saida")}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: tipo === "saida" ? "#fee2e2" : "#fff",
              color: tipo === "saida" ? "#b91c1c" : "#374151",
              fontWeight: 700,
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Saída
          </button>
        </div>

        {/* Data */}
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Data
        </label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={inputStyle}
          disabled={loading}
        />

        {/* Categoria */}
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginTop: 14,
            marginBottom: 6,
          }}
        >
          Categoria
        </label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(Number(e.target.value))}
          style={inputStyle}
          disabled={loading}
        >
          <option value="">Selecione...</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Valor */}
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginTop: 14,
            marginBottom: 6,
          }}
        >
          Valor
        </label>
        <input
          type="text"
          placeholder="Ex.: 100,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={inputStyle}
          disabled={loading}
        />

        {/* Descrição */}
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginTop: 14,
            marginBottom: 6,
          }}
        >
          Descrição
        </label>
        <input
          type="text"
          placeholder="Opcional"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={inputStyle}
          disabled={loading}
        />

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 18,
            justifyContent: "flex-start",
          }}
        >
          <button
            type="submit"
            disabled={!canSubmit || submitting || loading}
            style={{
              background: "#6d28d9",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 700,
              opacity: !canSubmit || submitting || loading ? 0.7 : 1,
              cursor:
                !canSubmit || submitting || loading ? "not-allowed" : "pointer",
            }}
          >
            {submitting
              ? "Salvando..."
              : isEdit
              ? "Salvar alterações"
              : "Salvar"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={{
              background: "#fff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "10px 12px",
  outline: "none",
  fontSize: 14,
  color: "#111827",
  background: "#fff",
};
