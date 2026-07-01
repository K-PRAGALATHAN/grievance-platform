"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "../components/PortalShell";
import { api, Complaint, getSession, User } from "../../lib/api";

const nav = [
  { label: "Overview", href: "#overview", mark: "01" },
  { label: "Submit complaint", href: "#submit", mark: "02" },
  { label: "My complaints", href: "#complaints", mark: "03" },
  { label: "Documents", href: "#documents", mark: "04" },
  { label: "Updates & feedback", href: "#updates", mark: "05" },
];

export default function CitizenPortal() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [complaintData, categoryData] = await Promise.all([
        api<{ complaints: Complaint[] }>("/complaints"),
        api<{ id: number; name: string }[]>("/categories"),
      ]);
      setComplaints(complaintData.complaints);
      setCategories(categoryData);
      setSelected((current) => current || complaintData.complaints[0]?.id || null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to load portal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function openPortal() {
      await Promise.resolve();
      const session = getSession();
      if (!session) return router.replace("/login");
      if (session.user.role !== "CITIZEN") return router.replace("/officer");
      setUser(session.user);
      await load();
    }
    openPortal();
  }, [load, router]);

  const counts = useMemo(() => ({
    active: complaints.filter((item) => !["RESOLVED", "REJECTED"].includes(item.status)).length,
    resolved: complaints.filter((item) => item.status === "RESOLVED").length,
  }), [complaints]);

  async function createComplaint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Submitting complaint…");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ complaint: Complaint }>("/complaints", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"), description: form.get("description"),
          categoryId: form.get("categoryId") || undefined,
          locationText: form.get("locationText"), language: "en", sourceChannel: "WEB",
        }),
      });
      event.currentTarget.reset();
      setSelected(result.complaint.id);
      setMessage(`Complaint ${result.complaint.complaintNumber} was registered.`);
      await load();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Submission failed."); }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return setMessage("Select a complaint before uploading.");
    const form = new FormData(event.currentTarget);
    try {
      await api(`/complaints/${selected}/attachments`, { method: "POST", body: form });
      event.currentTarget.reset();
      setMessage("Evidence uploaded and attached to the complaint.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Upload failed."); }
  }

  async function feedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return setMessage("Select a complaint first.");
    const form = new FormData(event.currentTarget);
    try {
      await api(`/complaints/${selected}/feedback`, {
        method: "POST", body: JSON.stringify({ rating: Number(form.get("rating")), comment: form.get("comment") }),
      });
      event.currentTarget.reset();
      setMessage("Your feedback was recorded.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Feedback could not be saved."); }
  }

  if (!user) return <div className="portal-loading">Opening secure citizen workspace…</div>;

  return (
    <PortalShell user={user} nav={nav} portal="Citizen portal">
      <section className="portal-intro" id="overview">
        <div><span className="eyebrow">Citizen service desk</span><h1>Good day, {user.name.split(" ")[0]}.</h1><p>Register an issue, provide evidence, and follow every official action from one traceable record.</p></div>
        <div className="trust-stamp"><span>Account status</span><strong>Verified access</strong><small>Secure API session active</small></div>
      </section>
      {message && <div className="service-message" role="status">{message}</div>}
      <section className="summary-strip">
        <div><span>Total submitted</span><strong>{loading ? "—" : complaints.length}</strong></div>
        <div><span>Active cases</span><strong>{loading ? "—" : counts.active}</strong></div>
        <div><span>Resolved</span><strong>{loading ? "—" : counts.resolved}</strong></div>
        <div><span>Evidence limit</span><strong>10 MB</strong></div>
      </section>

      <PortalSection id="submit" number="01" title="Register a new complaint" text="Start with a precise subject, location, and factual description.">
        <form className="service-form" onSubmit={createComplaint}>
          <div className="field"><label htmlFor="title">Complaint subject *</label><input id="title" name="title" required placeholder="Example: Damaged water line on Lake Road" /></div>
          <div className="form-two">
            <div className="field"><label htmlFor="categoryId">Service category</label><select id="categoryId" name="categoryId" defaultValue=""><option value="">Not sure / route for me</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>
            <div className="field"><label htmlFor="locationText">Location</label><input id="locationText" name="locationText" placeholder="Street, ward, landmark" /></div>
          </div>
          <div className="field"><label htmlFor="description">Detailed description *</label><textarea id="description" name="description" required placeholder="Explain what happened, when it began, and who is affected." /></div>
          <button className="primary-button">Register complaint</button>
        </form>
      </PortalSection>

      <PortalSection id="complaints" number="02" title="My complaint register" text="Select a record to use it in documents or feedback below.">
        <div className="record-list">
          {complaints.length === 0 && <div className="empty-state">No complaints registered yet.</div>}
          {complaints.map((item) => <button className={`record-row ${selected === item.id ? "selected" : ""}`} onClick={() => setSelected(item.id)} key={item.id}><div><span>{item.complaintNumber}</span><strong>{item.title}</strong><small>{item.department?.name || "Awaiting department routing"} · {new Date(item.createdAt).toLocaleDateString()}</small></div><b className={`status status-${item.status.toLowerCase()}`}>{item.status.replaceAll("_", " ")}</b></button>)}
        </div>
      </PortalSection>

      <PortalSection id="documents" number="03" title="Supporting documents" text="Upload an image, PDF, audio, video, or document to the selected complaint.">
        <form className="inline-service" onSubmit={upload}><div><strong>Selected case</strong><span>{complaints.find((item) => item.id === selected)?.complaintNumber || "None selected"}</span></div><div className="field file-field"><label htmlFor="file">Evidence file (maximum 10 MB)</label><input id="file" name="file" type="file" required accept="image/*,.pdf,audio/*,video/*,.doc,.docx" /></div><button className="secondary-button">Upload evidence</button></form>
      </PortalSection>

      <PortalSection id="updates" number="04" title="Resolution feedback" text="Feedback is accepted by the API once per complaint; choose a resolved case before submitting.">
        <form className="service-form compact-form" onSubmit={feedback}>
          <div className="form-two"><div className="field"><label htmlFor="rating">Service rating</label><select id="rating" name="rating" defaultValue="5"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Satisfactory</option><option value="2">2 — Poor</option><option value="1">1 — Very poor</option></select></div><div className="field"><label htmlFor="comment">Comment</label><input id="comment" name="comment" placeholder="Tell us whether the issue was resolved" /></div></div>
          <button className="primary-button">Submit feedback</button>
        </form>
      </PortalSection>
    </PortalShell>
  );
}

function PortalSection({ id, number, title, text, children }: { id: string; number: string; title: string; text: string; children: React.ReactNode }) {
  return <section className="portal-section" id={id}><header><span>{number}</span><div><h2>{title}</h2><p>{text}</p></div></header>{children}</section>;
}
