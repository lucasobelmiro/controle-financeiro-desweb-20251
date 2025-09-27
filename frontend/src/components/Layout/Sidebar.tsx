import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/transactions", label: "Transações" },
  { to: "/categories", label: "Categorias" },
  { to: "/reports", label: "Extrato" },
  { to: "/profile", label: "Perfil" },
  { to: "/admin", label: "Admin" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Controle Financeiro</div>
      <nav className="nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              "nav-item" + (isActive ? " is-active" : "")
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
