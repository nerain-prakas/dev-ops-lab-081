const STORAGE_KEY = "coursehub_session";

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
        return JSON.parse(value);
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
