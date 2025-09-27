import Sidebar from "./Sidebar";
import type { ReactNode } from "react";

type Props = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function MainLayout({ title, actions, children }: Props) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <header className="page-header">
          <h1 className="page-title">{title}</h1>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </header>

        <section className="card">{children}</section>
      </main>
    </div>
  );
}
