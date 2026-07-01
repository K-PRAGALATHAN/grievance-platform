export type Role = "CITIZEN" | "OFFICER" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type Complaint = {
  id: number;
  complaintNumber: string;
  title: string;
  description: string;
  status: string;
  priority?: string | null;
  locationText?: string | null;
  createdAt: string;
  department?: { name: string } | null;
  category?: { name: string } | null;
  citizen?: { name: string; email: string };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function getSession() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("grievance_token");
  const rawUser = localStorage.getItem("grievance_user");
  if (!token || !rawUser) return null;
  try {
    return { token, user: JSON.parse(rawUser) as User };
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: User) {
  localStorage.setItem("grievance_token", token);
  localStorage.setItem("grievance_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("grievance_token");
  localStorage.removeItem("grievance_user");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession();
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || "The service could not complete this request.");
  return payload.data as T;
}
