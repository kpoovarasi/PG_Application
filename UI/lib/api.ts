/**
 * lib/api.ts — Centralized API client connecting Next.js UI → FastAPI backend
 *
 * Usage:
 *   import { api } from "@/lib/api"
 *   const tenants = await api.tenants.list()
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Token helpers ─────────────────────────────────────────────────────────────

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("pg_token");
}

function setToken(token: string) {
    localStorage.setItem("pg_token", token);
}

function clearToken() {
    localStorage.removeItem("pg_token");
}

// ── Base fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "API request failed");
    }

    if (res.status === 204) return undefined as unknown as T;
    return res.json();
}

// ── API namespaces (one per router / UI page group) ───────────────────────────

export const api = {

    // ── Auth (login-page.tsx) ──────────────────────────────────────────────────
    auth: {
        login: (email: string, password: string) =>
            request<{ access_token: string; role: string; user_id: number; name: string }>(
                "/auth/login",
                { method: "POST", body: JSON.stringify({ email, password }) }
            ).then((data) => {
                setToken(data.access_token);
                return data;
            }),

        logout: () => { clearToken(); },

        me: (token: string) =>
            request<{ id: number; name: string; email: string; role: string }>(
                `/auth/me?token=${token}`
            ),
    },

    // ── Dashboard (admin-dashboard.tsx) ───────────────────────────────────────
    dashboard: {
        summary: () => request<Record<string, number>>("/dashboard/summary"),
        pgsOverview: () => request<any[]>("/dashboard/pgs-overview"),
    },

    // ── PGs (admin-portal.tsx) ────────────────────────────────────────────────
    pgs: {
        list: () => request<any[]>("/pgs"),
        get: (id: number) => request<any>(`/pgs/${id}`),
        create: (data: any) => request<any>("/pgs", { method: "POST", body: JSON.stringify(data) }),
        update: (id: number, data: any) =>
            request<any>(`/pgs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
        delete: (id: number) => request<void>(`/pgs/${id}`, { method: "DELETE" }),
    },

    // ── Rooms (admin-rooms.tsx, tenant-room.tsx) ──────────────────────────────
    rooms: {
        list: (pgId?: number) =>
            request<any[]>(pgId ? `/rooms?pg_id=${pgId}` : "/rooms"),
        get: (id: number) => request<any>(`/rooms/${id}`),
        create: (data: any) =>
            request<any>("/rooms", { method: "POST", body: JSON.stringify(data) }),
        update: (id: number, data: any) =>
            request<any>(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
        delete: (id: number) => request<void>(`/rooms/${id}`, { method: "DELETE" }),
        assets: (roomId: number) => request<any[]>(`/rooms/${roomId}/assets`),
        commonAssets: () => request<any[]>("/rooms/assets/common"),
    },

    // ── Tenants (admin-tenants.tsx, tenant-profile.tsx) ──────────────────────
    tenants: {
        list: (status?: string) =>
            request<any[]>(status ? `/tenants?status=${status}` : "/tenants"),
        get: (id: number) => request<any>(`/tenants/${id}`),
        byRoom: (roomId: number) => request<any[]>(`/tenants/by-room/${roomId}`),
        byUser: (userId: number) => request<any>(`/tenants/by-user/${userId}`),
        create: (data: any) =>
            request<any>("/tenants", { method: "POST", body: JSON.stringify(data) }),
        update: (id: number, data: any) =>
            request<any>(`/tenants/${id}`, { method: "PUT", body: JSON.stringify(data) }),
        delete: (id: number) => request<void>(`/tenants/${id}`, { method: "DELETE" }),
    },

    // ── Invoices (admin-invoices.tsx, tenant-invoices.tsx) ────────────────────
    invoices: {
        list: (params?: { tenantId?: number; status?: string }) => {
            const q = new URLSearchParams();
            if (params?.tenantId) q.set("tenant_id", String(params.tenantId));
            if (params?.status) q.set("status", params.status);
            return request<any[]>(`/invoices${q.toString() ? "?" + q : ""}`);
        },
        get: (id: number) => request<any>(`/invoices/${id}`),
        create: (data: any) =>
            request<any>("/invoices", { method: "POST", body: JSON.stringify(data) }),
        update: (id: number, data: any) =>
            request<any>(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
        delete: (id: number) => request<void>(`/invoices/${id}`, { method: "DELETE" }),
        markPaid: (id: number, paidDate: string) =>
            request<any>(`/invoices/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status: "paid", paid_date: paidDate }),
            }),
    },

    // ── Tickets (admin-tickets.tsx, tenant-tickets.tsx) ───────────────────────
    tickets: {
        list: (params?: { tenantId?: number; status?: string; priority?: string }) => {
            const q = new URLSearchParams();
            if (params?.tenantId) q.set("tenant_id", String(params.tenantId));
            if (params?.status) q.set("status", params.status);
            if (params?.priority) q.set("priority", params.priority);
            return request<any[]>(`/tickets${q.toString() ? "?" + q : ""}`);
        },
        get: (id: number) => request<any>(`/tickets/${id}`),
        create: (data: any) =>
            request<any>("/tickets", { method: "POST", body: JSON.stringify(data) }),
        update: (id: number, data: any) =>
            request<any>(`/tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
        delete: (id: number) => request<void>(`/tickets/${id}`, { method: "DELETE" }),
    },

    // ── Messages (admin-messages.tsx, tenant-notifications.tsx) ──────────────
    messages: {
        list: () => request<any[]>("/messages"),
        forTenant: (tenantId: number) =>
            request<any[]>(`/messages/tenant/${tenantId}`),
        send: (data: any) =>
            request<any>("/messages", { method: "POST", body: JSON.stringify(data) }),
        delete: (id: number) => request<void>(`/messages/${id}`, { method: "DELETE" }),
    },

    // ── Menu (admin-menu.tsx, tenant-menu-view.tsx) ───────────────────────────
    menu: {
        all: () => request<any[]>("/menu"),
        forDay: (day: string) => request<any>(`/menu/${day}`),
        update: (day: string, data: any) =>
            request<any>(`/menu/${day}`, { method: "PUT", body: JSON.stringify(data) }),
    },

    // ── Holidays (admin-holidays.tsx, tenant-holidays.tsx) ────────────────────
    holidays: {
        list: () => request<any[]>("/holidays"),
        create: (data: any) =>
            request<any>("/holidays", { method: "POST", body: JSON.stringify(data) }),
        delete: (id: number) => request<void>(`/holidays/${id}`, { method: "DELETE" }),
    },
};

export { getToken, setToken, clearToken };
