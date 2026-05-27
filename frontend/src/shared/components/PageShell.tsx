import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import type { CurrentUser } from "../../api/contracts";

interface PageShellProps {
  user: CurrentUser | null;
}

function BrandBlock() {
  return (
    <div className="brand-block">
      <span className="brand-mark">S</span>
      <div>
        <strong>SANIL QA</strong>
        <small>Photo Inspection</small>
      </div>
    </div>
  );
}

export function PageShell({ user }: PageShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const closeDrawer = () => setIsDrawerOpen(false);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isCaptureRoute = location.pathname.includes("/capture/");
  const frameClassName = [
    "app-frame",
    isAdminRoute ? "app-frame--admin" : "app-frame--operator",
    isCaptureRoute ? "app-frame--capture" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={frameClassName}>
      <header className="app-topbar">
        <button
          aria-label="메뉴 열기"
          className="icon-button icon-button--inverse"
          type="button"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu size={22} />
        </button>
        <BrandBlock />
        <div className="app-topbar__context">
          <strong>{isAdminRoute ? "관리자" : isCaptureRoute ? "검사 촬영" : "작업자"}</strong>
          {user ? <span>{user.name}</span> : null}
        </div>
      </header>

      <aside className={isDrawerOpen ? "app-sidebar app-sidebar--open" : "app-sidebar"}>
        <div className="sidebar-header">
          <BrandBlock />
          <button
            aria-label="메뉴 닫기"
            className="icon-button icon-button--inverse sidebar-close"
            type="button"
            onClick={closeDrawer}
          >
            <X size={22} />
          </button>
        </div>
        <nav className="main-nav" aria-label="주요 화면">
          <NavLink to="/products" onClick={closeDrawer}>
            제품
          </NavLink>
          <NavLink to="/inspections/history" onClick={closeDrawer}>
            검사 이력
          </NavLink>
          {user?.authority === "ADMIN" ? (
            <NavLink to="/admin/references" onClick={closeDrawer}>
              기준 사진 관리
            </NavLink>
          ) : null}
        </nav>
        {user ? (
          <div className="user-block">
            <span>{user.name}</span>
            <small>{user.loginId}</small>
          </div>
        ) : null}
      </aside>

      {isDrawerOpen ? <button aria-label="메뉴 닫기" className="drawer-backdrop" type="button" onClick={closeDrawer} /> : null}

      <main className={isCaptureRoute ? "app-main app-main--capture" : "app-main"}>
        <Outlet />
      </main>
    </div>
  );
}
