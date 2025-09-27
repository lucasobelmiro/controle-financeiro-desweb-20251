import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserDTO,
  type UserRole,
} from "../services/users";

export default function AdminUsers() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState<UserRole>("user");
  const canCreate = useMemo(
    () => !!cName.trim() && !!cEmail.trim() && cPassword.length >= 6,
    [cName, cEmail, cPassword]
  );
  const [savingCreate, setSavingCreate] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent] = useState<UserDTO | null>(null);
  const [eName, setEName] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [ePassword, setEPassword] = useState("");
  const [eRole, setERole] = useState<UserRole>("user");
  const canEdit = useMemo(
    () => !!eName.trim() && !!eEmail.trim(),
    [eName, eEmail]
  );
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getUsers();
        if (alive) setItems(data);
      } catch (err: any) {
        console.error(err);
        if (alive)
          setError(err?.response?.data?.message || "Falha ao listar usuários.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  function resetCreate() {
    setCName("");
    setCEmail("");
    setCPassword("");
    setCRole("user");
  }
  function resetEdit() {
    setCurrent(null);
    setEName("");
    setEEmail("");
    setEPassword("");
    setERole("user");
  }

  async function handleCreate() {
    if (!canCreate) return;
    try {
      setSavingCreate(true);
      const created = await createUser({
        name: cName.trim(),
        email: cEmail.trim(),
        password: cPassword,
        role: cRole,
      });
      setItems((prev) => [...prev, created]);
      setOpenCreate(false);
      resetCreate();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao criar usuário.");
    } finally {
      setSavingCreate(false);
    }
  }

  function openEditModal(u: UserDTO) {
    setCurrent(u);
    setEName(u.name);
    setEEmail(u.email);
    setERole(u.role);
    setEPassword("");
    setOpenEdit(true);
  }

  async function handleSaveEdit() {
    if (!current || !canEdit) return;
    try {
      setSavingEdit(true);
      const updated = await updateUser(current.id, {
        name: eName.trim(),
        email: eEmail.trim(),
        role: eRole,
        password: ePassword.trim() ? ePassword : undefined,
      });
      setItems((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it))
      );
      setOpenEdit(false);
      resetEdit();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao atualizar usuário.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await deleteUser(id);
      setItems((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao excluir usuário.");
    }
  }

  const newUserBtn = isAdmin ? (
    <button
      type="button"
      onClick={() => setOpenCreate(true)}
      style={styles.primaryBtn}
    >
      + Novo Usuário
    </button>
  ) : null;

  if (!isAdmin) {
    return (
      <MainLayout title="Admin • Usuários">
        <div style={{ padding: 16, color: "#6b7280" }}>
          Apenas administradores podem acessar esta tela.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Admin • Usuários" actions={newUserBtn}>
      {/* Tabela */}
      <div style={styles.card}>
        {/* Cabeçalho */}
        <div style={styles.tableHeader}>
          <div style={{ width: 90 }}>ID</div>
          <div>Nome</div>
          <div>Email</div>
          <div style={{ width: 120 }}>Role</div>
          <div style={{ width: 160, textAlign: "right" }}>Ações</div>
        </div>

        {/* Corpo */}
        {loading && <div style={styles.muted}>Carregando…</div>}
        {error && !loading && <div style={styles.danger}>{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div style={styles.muted}>Nenhum usuário encontrado.</div>
        )}

        {!loading &&
          !error &&
          items.map((u, idx) => (
            <div
              key={u.id}
              style={{
                ...styles.row,
                background: idx % 2 ? "#fafafa" : "#fff",
              }}
            >
              <div style={{ width: 90 }}>{u.id}</div>
              <div>{u.name}</div>
              <div>{u.email}</div>
              <div style={{ width: 120 }}>{u.role}</div>
              <div style={{ width: 160, textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => openEditModal(u)}
                  style={styles.linkBtn}
                >
                  Editar
                </button>{" "}
                |{" "}
                <button
                  type="button"
                  onClick={() => handleDelete(u.id)}
                  style={styles.linkDanger}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
      </div>

      <p style={{ color: "#6b7280", fontSize: 13, marginTop: 12 }}>
        Apenas administradores podem acessar esta tela.
      </p>

      {/* Modal Criar */}
      {openCreate && (
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Novo Usuário</h3>

            <label style={styles.label}>Nome</label>
            <input
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Email</label>
            <input
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              placeholder="Mín. 6 caracteres"
              style={styles.input}
            />

            <label style={styles.label}>Role</label>
            <select
              value={cRole}
              onChange={(e) => setCRole(e.target.value as UserRole)}
              style={styles.input}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                disabled={!canCreate || savingCreate}
                onClick={handleCreate}
                style={{
                  ...styles.primaryBtn,
                  opacity: !canCreate || savingCreate ? 0.7 : 1,
                  cursor:
                    !canCreate || savingCreate ? "not-allowed" : "pointer",
                }}
              >
                {savingCreate ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenCreate(false);
                  resetCreate();
                }}
                style={styles.secondaryBtn}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {openEdit && current && (
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Editar Usuário</h3>

            <label style={styles.label}>Nome</label>
            <input
              value={eName}
              onChange={(e) => setEName(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Email</label>
            <input
              value={eEmail}
              onChange={(e) => setEEmail(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>Senha (opcional)</label>
            <input
              type="password"
              value={ePassword}
              onChange={(e) => setEPassword(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              style={styles.input}
            />

            <label style={styles.label}>Role</label>
            <select
              value={eRole}
              onChange={(e) => setERole(e.target.value as UserRole)}
              style={styles.input}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                disabled={!canEdit || savingEdit}
                onClick={handleSaveEdit}
                style={{
                  ...styles.primaryBtn,
                  opacity: !canEdit || savingEdit ? 0.7 : 1,
                  cursor: !canEdit || savingEdit ? "not-allowed" : "pointer",
                }}
              >
                {savingEdit ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenEdit(false);
                  resetEdit();
                }}
                style={styles.secondaryBtn}
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

/* estilos */
const styles: Record<string, React.CSSProperties> = {
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    background: "#6d28d9",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "90px 1fr 1fr 120px 160px",
    background: "#f3f4f6",
    padding: "12px 16px",
    fontWeight: 700,
    color: "#111827",
    alignItems: "center",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "90px 1fr 1fr 120px 160px",
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    alignItems: "center",
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#4f46e5",
    fontWeight: 700,
    cursor: "pointer",
  },
  linkDanger: {
    background: "transparent",
    border: "none",
    color: "#dc2626",
    fontWeight: 700,
    cursor: "pointer",
  },
  muted: { padding: 16, color: "#6b7280" },
  danger: { padding: 16, color: "#b91c1c" },

  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 50,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  label: { display: "block", fontWeight: 600, marginBottom: 6, marginTop: 8 },
  input: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    color: "#111827",
    background: "#fff",
  },
};
