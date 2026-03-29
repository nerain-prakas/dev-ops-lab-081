const STORAGE_KEY = "coursehub_session";

function decodeJwtPayload(token) {
    try {
        const parts = String(token || "").split('.');
        if (parts.length !== 3) return null;

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

function isExpiredToken(token) {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') {
        return true;
    }
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
}

export function setSession({ accessToken, user }) {
    const session = {
        accessToken,
        user,
        role: user?.role?.toLowerCase() || "student",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession() {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    try {
        const session = JSON.parse(value);
        const token = session?.accessToken;

        if (!token || isExpiredToken(token)) {
            clearSession();
            return null;
        }

        return session;
    } catch {
        clearSession();
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
}

export function getToken() {
    return getSession()?.accessToken || "";
}

export function getRole() {
    return getSession()?.role || "";
}

export function getUser() {
    return getSession()?.user || null;
}

export function isAuthenticated() {
    return Boolean(getToken());
}

/** Returns true only if the current session role matches one of the given roles */
export function hasRole(...roles) {
    return roles.includes(getRole());
}
