import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { updateUser } from "../services/users";

export default function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role] = useState(user?.role ?? "user");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user?.name, user?.email]);

  const canSubmit = useMemo(() => {
    if (!name.trim() || !email.trim()) return false;
    if (password || confirm) {
      if (password.length < 6) return false;
      if (password !== confirm) return false;
    }
    return true;
  }, [name, email, password, confirm]);

  async function handleSave() {
    if (!user?.id || !canSubmit) return;
    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      const payload: { name?: string; email?: string; password?: string } = {
        name: name.trim(),
        email: email.trim(),
      };
      if (password) payload.password = password;

      await updateUser(user.id, payload);
      setMsg("Dados atualizados com sucesso!");
      if (password) {
        setTimeout(() => {
          alert("Senha alterada. Faça login novamente.");
          logout();
        }, 800);
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  const lastLogin = useMemo(() => {
    const ts = localStorage.getItem("last_login_at");
    return ts ? new Date(Number(ts)).toLocaleString() : "-";
  }, []);
  const sessionMinutes = useMemo(() => {
    const start = localStorage.getItem("session_started_at");
    if (!start) return "-";
    const diff = Date.now() - Number(start);
    return Math.max(1, Math.floor(diff / 60000)) + " min";
  }, []);

  return (
    <MainLayout
      title="Meu Perfil"
      actions={
        <button
          onClick={handleSave}
          disabled={!canSubmit || saving}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            fontWeight: 700,
            cursor: !canSubmit || saving ? "not-allowed" : "pointer",
            opacity: !canSubmit || saving ? 0.7 : 1,
          }}
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      }
    >
      {/* feedback */}
      {msg && (
        <div style={{ marginBottom: 12, color: "#065f46", fontWeight: 600 }}>
          {msg}
        </div>
      )}
      {err && (
        <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 600 }}>
          {err}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 20,
        }}
      >
        {/* formulário */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <label style={label}>Nome</label>
          <input
            style={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label style={label}>Email</label>
          <input
            style={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={label}>Role</label>
          <input style={input} value={role} readOnly />

          <label style={label}>Senha (opcional)</label>
          <input
            style={input}
            type="password"
            value={password}
            placeholder="Deixe em branco para não alterar"
            onChange={(e) => setPassword(e.target.value)}
          />

          <label style={label}>Confirmar senha</label>
          <input
            style={input}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {/* cartão de segurança */}
        <aside
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#f3f4f6",
              padding: "10px 14px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Segurança
          </div>
          <div style={{ padding: 14, color: "#111827" }}>
            <div style={secRow}>
              <span style={secKey}>Sessão ativa:</span>
              <span>{sessionMinutes}</span>
            </div>
            <div style={secRow}>
              <span style={secKey}>2FA:</span>
              <span>desativado</span>
            </div>
            <div style={secRow}>
              <span style={secKey}>Último login:</span>
              <span>{lastLogin}</span>
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}

const label: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  marginTop: 8,
  marginBottom: 6,
};

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

const secRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "6px 0",
  borderBottom: "1px solid #f1f5f9",
};

localStorage.setItem("last_login_at", String(Date.now()));
localStorage.setItem("session_started_at", String(Date.now()));

const secKey: React.CSSProperties = { color: "#6b7280", marginRight: 8 };
