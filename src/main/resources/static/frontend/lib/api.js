import { clearSession } from './auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://dev-ops-lab-081.onrender.com").replace(/\/+$/, "");

export async function apiRequest(path, { method = "GET", token, data } = {}) {
    const response = await fetch(`${API_BASE_URL}${path.startsWith("/api") ? path : `/api${path}`}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: data ? JSON.stringify(data) : undefined,
    });

    const text = await response.text();
    let payload = {};
    try {
        payload = text ? JSON.parse(text) : {};
    } catch {
        payload = text ? { message: text } : {};
    }

    if (!response.ok) {
        if (response.status === 401) {
            clearSession();
            const message = payload.error || payload.message || 'Session expired. Please sign in again.';
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            throw new Error(message);
        }
        throw new Error(payload.error || payload.message || "Request failed");
    }

    return payload;
}

export { API_BASE_URL };
