"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getSession, saveSession, User } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) routeFor(session.user);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function routeFor(user: User) {
    router.replace(user.role === "CITIZEN" ? "/citizen" : "/officer");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      saveSession(result.token, result.user);
      routeFor(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-aside">
        <div className="login-brand"><div className="seal">CG</div><span>Civic Grievance Portal</span></div>
        <div className="login-statement">
          <span className="eyebrow">One verified entry point</span>
          <h1>Public service, with a clear line of accountability.</h1>
          <p>Citizens and officials use the same secure sign-in. Your account role automatically opens the correct workspace and permissions.</p>
        </div>
        <p className="support-text">Access is role-controlled. Case activity is retained for continuity, review, and public accountability.</p>
      </section>
      <section className="login-main">
        <div className="login-form-panel">
          <div className="access-index"><span>01</span><p><strong>Identity verified</strong>Your registered account is authenticated.</p><span>02</span><p><strong>Role resolved</strong>Citizen, officer, or administrator access is applied.</p><span>03</span><p><strong>Portal opened</strong>Only authorized services are shown.</p></div>
          <span className="eyebrow">Secure account access</span>
          <h2>Sign in to continue</h2>
          <p className="support-text">Use the email and password registered with the grievance service.</p>
          <form onSubmit={submit}>
            <div className="field-stack">
              <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="name@example.gov" /></div>
              <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter password" /></div>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button full-button" disabled={busy}>{busy ? "Verifying…" : "Continue securely"}</button>
          </form>
          <div className="login-footer"><strong>Portal routing:</strong> citizens continue to complaint services; officers and administrators continue to case operations.</div>
        </div>
      </section>
    </main>
  );
}
