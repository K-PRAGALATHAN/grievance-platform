"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearSession, User } from "../../lib/api";

export type NavItem = { label: string; href: string; mark: string };

export default function PortalShell({
  user,
  nav,
  portal,
  children,
}: {
  user: User;
  nav: NavItem[];
  portal: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  return (
    <main className="portal-shell">
      <aside className="left-rail" aria-label="Primary navigation">
        <div className="rail-seal">CG</div>
        <div className="rail-expand">
          <div className="rail-brand">
            <strong>Civic Grievance</strong>
            <span>{portal}</span>
          </div>
          <nav className="rail-links">
            {nav.map((item) => (
              <a href={item.href} key={item.href}>
                <i>{item.mark}</i><span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="rail-signout" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <header className="portal-topbar">
        <div>
          <span className="eyebrow">Government service workspace</span>
          <strong>{portal}</strong>
        </div>
        <div className="profile-chip" title={`${user.name} · ${user.role}`}>
          <div className="profile-avatar">{initials}</div>
          <div><strong>{user.name}</strong><span>{user.role.toLowerCase()}</span></div>
        </div>
      </header>
      <div className="portal-content">{children}</div>
    </main>
  );
}
