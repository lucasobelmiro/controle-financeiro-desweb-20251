import { useEffect, useState } from "react";
import MainLayout from "../../components/Layout/MainLayout";
import {
  getCategories,
  createCategory,
  deleteCategory,
  type CategoryDTO,
} from "../../services/categories";

export default function Categories() {
  const [items, setItems] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCategories();
        if (alive) setItems(data ?? []);
      } catch (err: any) {
        console.error(err);
        if (alive)
          setError(
            err?.response?.data?.message || "Falha ao carregar categorias."
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      setSaving(true);
      const created = await createCategory(newName.trim());
      setItems((prev) => [...prev, created]);
      setOpen(false);
      setNewName("");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao criar categoria.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = confirm("Tem certeza que deseja excluir esta categoria?");
    if (!ok) return;
    try {
      await deleteCategory(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao excluir categoria.");
    }
  }

  const newCategoryBtn = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#f9fafb",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      + Nova Categoria
    </button>
  );

  return (
    <MainLayout title="Categorias" actions={newCategoryBtn}>
      {/* Tabela */}
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
            gridTemplateColumns: "1fr 160px",
            background: "#f3f4f6",
            padding: "12px 16px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          <div>Nome da categoria</div>
          <div style={{ textAlign: "right" }}>Ações</div>
        </div>

        {/* Corpo */}
        {loading && (
          <div style={{ padding: 16, color: "#6b7280" }}>Carregando…</div>
        )}

        {error && !loading && (
          <div style={{ padding: 16, color: "#b91c1c" }}>{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ padding: 16, color: "#6b7280" }}>
            Nenhuma categoria encontrada.
          </div>
        )}

        {!loading &&
          !error &&
          items.map((c, idx) => (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px",
                padding: "12px 16px",
                borderTop: "1px solid #f1f5f9",
                background: idx % 2 ? "#fafafa" : "#fff",
                alignItems: "center",
              }}
            >
              <div>{c.name}</div>
              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  style={linkBtn}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal Nova Categoria */}
      {open && (
        <div style={backdrop}>
          <div style={modal}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#111827",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Adicionar Categoria
            </h3>

            <label
              style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
            >
              Nome
            </label>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
              placeholder="Ex.: Alimentação"
            />

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim() || saving}
                style={{
                  background: "#6d28d9",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontWeight: 700,
                  opacity: !newName.trim() || saving ? 0.7 : 1,
                  cursor: !newName.trim() || saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setNewName("");
                }}
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
          </div>
        </div>
      )}
    </MainLayout>
  );
}

/* estilos reutilizados */
const linkBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#dc2626",
  fontWeight: 700,
  cursor: "pointer",
  padding: 0,
};

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

const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  zIndex: 50,
};

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
  padding: 20,
};
