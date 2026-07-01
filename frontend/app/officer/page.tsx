"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "../components/PortalShell";
import { api, Complaint, getSession, User } from "../../lib/api";

const nav = [
  { label: "Operations overview", href: "#overview", mark: "01" },
  { label: "Assigned queue", href: "#queue", mark: "02" },
  { label: "Case action", href: "#action", mark: "03" },
  { label: "Notes & response", href: "#response", mark: "04" },
  { label: "AI assistance", href: "#assistance", mark: "05" },
  { label: "Alerts", href: "#alerts", mark: "06" },
];
const statuses = ["SUBMITTED", "TRIAGED", "ASSIGNED", "IN_REVIEW", "RESOLVED", "REJECTED", "ESCALATED"];

export default function OfficerPortal() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<{ id: number; message: string; isRead: boolean; createdAt: string }[]>([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [caseData, alertData] = await Promise.all([
        api<{ complaints: Complaint[] }>("/complaints"),
        api<{ id: number; message: string; isRead: boolean; createdAt: string }[]>("/alerts"),
      ]);
      setComplaints(caseData.complaints);
      setAlerts(alertData);
      setSelected((current) => current || caseData.complaints[0]?.id || null);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Unable to load operations."); }
  }, []);

  useEffect(() => {
    async function openPortal() {
      await Promise.resolve();
      const session = getSession();
      if (!session) return router.replace("/login");
      if (session.user.role === "CITIZEN") return router.replace("/citizen");
      setUser(session.user);
      await load();
    }
    openPortal();
  }, [load, router]);

  const current = complaints.find((item) => item.id === selected);
  const counts = useMemo(() => ({
    review: complaints.filter((item) => item.status === "IN_REVIEW").length,
    escalated: complaints.filter((item) => item.status === "ESCALATED").length,
    resolved: complaints.filter((item) => item.status === "RESOLVED").length,
  }), [complaints]);

  async function perform(path: string, body?: object) {
    if (!selected) return setMessage("Select an assigned complaint first.");
    try {
      await api(path.replace(":id", String(selected)), { method: "POST", body: body ? JSON.stringify(body) : undefined });
      setMessage("Case record updated successfully.");
      await load();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Action failed."); }
  }

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return setMessage("Select a complaint first.");
    const form = new FormData(event.currentTarget);
    try {
      await api(`/complaints/${selected}/status`, { method: "PATCH", body: JSON.stringify({ status: form.get("status"), note: form.get("note") }) });
      setMessage("Status and audit history updated.");
      await load();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Status update failed."); }
  }

  async function submitText(event: FormEvent<HTMLFormElement>, kind: "notes" | "responses") {
    event.preventDefault();
    if (!selected) return setMessage("Select a complaint first.");
    const form = new FormData(event.currentTarget);
    const value = String(form.get("text"));
    try {
      await api(`/complaints/${selected}/${kind}`, { method: "POST", body: JSON.stringify(kind === "notes" ? { note: value } : { message: value, isFinalResponse: form.get("final") === "on" }) });
      event.currentTarget.reset();
      setMessage(kind === "notes" ? "Internal note saved." : "Response recorded.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Record could not be saved."); }
  }

  if (!user) return <div className="portal-loading">Opening secure operations workspace…</div>;

  return (
    <PortalShell user={user} nav={nav} portal={user.role === "ADMIN" ? "Administrative operations" : "Officer portal"}>
      <section className="portal-intro" id="overview"><div><span className="eyebrow">Case operations desk</span><h1>Service queue and decisions.</h1><p>Review assigned grievances in order, document each action, and provide citizens with a clear response trail.</p></div><div className="trust-stamp"><span>Authority</span><strong>{user.role}</strong><small>Authenticated official session</small></div></section>
      {message && <div className="service-message" role="status">{message}</div>}
      <section className="summary-strip"><div><span>Assigned records</span><strong>{complaints.length}</strong></div><div><span>In review</span><strong>{counts.review}</strong></div><div><span>Escalated</span><strong>{counts.escalated}</strong></div><div><span>Resolved</span><strong>{counts.resolved}</strong></div></section>

      <Section id="queue" number="01" title="Assigned complaint queue" text={user.role === "ADMIN" ? "Administrator view includes all complaints." : "The API returns only complaints assigned to your officer account."}>
        <div className="record-list">{complaints.length === 0 && <div className="empty-state">No cases are currently assigned.</div>}{complaints.map((item) => <button className={`record-row ${selected === item.id ? "selected" : ""}`} onClick={() => setSelected(item.id)} key={item.id}><div><span>{item.complaintNumber}</span><strong>{item.title}</strong><small>{item.citizen?.name || "Citizen"} · {item.locationText || "Location not supplied"}</small></div><b className={`status status-${item.status.toLowerCase()}`}>{item.status.replaceAll("_", " ")}</b></button>)}</div>
      </Section>

      <Section id="action" number="02" title="Case review and status" text={`Current selection: ${current?.complaintNumber || "No complaint selected"}`}>
        <div className="case-brief"><div><span>Complaint</span><strong>{current?.title || "Select a case from the queue"}</strong><p>{current?.description || "The complaint statement will appear here for operational review."}</p></div><div><span>Department</span><strong>{current?.department?.name || "Not routed"}</strong><span>Category</span><strong>{current?.category?.name || "Not classified"}</strong></div></div>
        <form className="inline-service status-form" onSubmit={updateStatus}><div className="field"><label htmlFor="status">New status</label><select id="status" name="status" defaultValue={current?.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div><div className="field"><label htmlFor="note">Audit note</label><input id="note" name="note" placeholder="Reason for this status change" /></div><button className="primary-button">Update case</button></form>
      </Section>

      <Section id="response" number="03" title="Internal notes and citizen response" text="Internal notes remain restricted to officials. Responses are visible to the citizen.">
        <div className="dual-forms">
          <form className="service-form" onSubmit={(event) => submitText(event, "notes")}><h3>Private case note</h3><div className="field"><label htmlFor="note-text">Operational note</label><textarea id="note-text" name="text" required placeholder="Record inspection findings, dependencies, or follow-up." /></div><button className="secondary-button">Save internal note</button></form>
          <form className="service-form" onSubmit={(event) => submitText(event, "responses")}><h3>Citizen communication</h3><div className="field"><label htmlFor="response-text">Official response</label><textarea id="response-text" name="text" required placeholder="Provide a clear action taken or next step." /></div><label className="check-row"><input type="checkbox" name="final" /> Mark as final response</label><button className="primary-button">Record response</button></form>
        </div>
      </Section>

      <Section id="assistance" number="04" title="Assisted case tools" text="These actions call the backend AI endpoints and retain their outputs against the selected complaint.">
        <div className="action-register"><button onClick={() => perform("/ai/analyze/:id")}><span>Analysis</span><strong>Analyze complaint</strong><small>Language, summary, category, priority, and location suggestions</small></button><button onClick={() => perform("/ai/route/:id")}><span>Routing</span><strong>Recommend routing</strong><small>Department and officer recommendation with confidence</small></button><button onClick={() => perform("/ai/draft-response/:id")}><span>Drafting</span><strong>Draft response</strong><small>Create an editable resolution draft for review</small></button><button onClick={() => perform("/complaints/:id/escalations", { reason: "Officer escalation from portal" })}><span>Escalation</span><strong>Escalate case</strong><small>Open a formal escalation record</small></button></div>
      </Section>

      <Section id="alerts" number="05" title="Service alerts" text="Notifications generated by backend case events.">
        <div className="alert-list">{alerts.length === 0 && <div className="empty-state">No service alerts.</div>}{alerts.map((alert) => <div className={alert.isRead ? "alert read" : "alert"} key={alert.id}><i></i><div><strong>{alert.message}</strong><span>{new Date(alert.createdAt).toLocaleString()}</span></div></div>)}</div>
      </Section>
    </PortalShell>
  );
}

function Section({ id, number, title, text, children }: { id: string; number: string; title: string; text: string; children: React.ReactNode }) {
  return <section className="portal-section" id={id}><header><span>{number}</span><div><h2>{title}</h2><p>{text}</p></div></header>{children}</section>;
}
