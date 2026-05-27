import { NavLink, Outlet } from "react-router-dom";
import type { CurrentUser } from "../../api/contracts";

interface PageShellProps {
  user: CurrentUser | null;
}

export function PageShell({ user }: PageShellProps) {
  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span className="brand-mark">S</span>
          <div>
            <strong>SANIL QA</strong>
            <small>Photo Inspection</small>
          </div>
        </div>
        <nav className="main-nav" aria-label="주요 화면">
          <NavLink to="/products">제품</NavLink>
          <NavLink to="/inspections/history">검사 이력</NavLink>
          {user?.authority === "ADMIN" ? <NavLink to="/admin/references">기준 사진 관리</NavLink> : null}
        </nav>
        {user ? (
          <div className="user-block">
            <span>{user.name}</span>
            <small>{user.loginId}</small>
          </div>
        ) : null}
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
