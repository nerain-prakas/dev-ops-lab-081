// ─────────────────────────────────────────────
// src/services/api.js
// Central API service — all calls go through here
// ─────────────────────────────────────────────

const BASE_URL = "/api";

// ── Helpers ──────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

function getHeaders(auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(method, path, body = null, auth = true) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(auth),
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// ── Auth ─────────────────────────────────────

export const authAPI = {
  login: (email, password) =>
    request("POST", "/login", { email, password }, false),

  register: (payload) =>
    request("POST", "/register", payload, false),
};

// ── Courses ───────────────────────────────────

export const coursesAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/courses${qs ? "?" + qs : ""}`, null, false);
  },

  getOne: (id) =>
    request("GET", `/courses/${id}`, null, false),

  create: (payload) =>
    request("POST", "/courses", payload),

  update: (id, payload) =>
    request("PUT", `/courses/${id}`, payload),

  delete: (id) =>
    request("DELETE", `/courses/${id}`),
};

// ── Reservations ──────────────────────────────

export const reservationsAPI = {
  getAll: () =>
    request("GET", "/reservations"),

  create: (course_id) =>
    request("POST", "/reserve", { course_id }),
};

// ── Payments ──────────────────────────────────

export const paymentsAPI = {
  getAll: () =>
    request("GET", "/payments"),

  make: (reservation_id, amount, payment_type) =>
    request("POST", "/payment", { reservation_id, amount, payment_type }),
};

// ── Enrollments ───────────────────────────────

export const enrollmentsAPI = {
  getAll: () =>
    request("GET", "/enrollments"),
};

// ── Admin ─────────────────────────────────────

export const adminAPI = {
  dashboard: () =>
    request("GET", "/admin/dashboard"),

  getUsers: (role = "") => {
    const qs = role ? `?role=${role}` : "";
    return request("GET", `/admin/users${qs}`);
  },

  deleteUser: (id) =>
    request("DELETE", `/admin/users/${id}`),

  changeRole: (id, role) =>
    request("PATCH", `/admin/users/${id}/role`, { role }),

  getCourses: () =>
    request("GET", "/admin/courses"),

  deleteCourse: (id) =>
    request("DELETE", `/admin/courses/${id}`),

  getReservations: (status = "") => {
    const qs = status ? `?status=${status}` : "";
    return request("GET", `/admin/reservations${qs}`);
  },

  updateReservation: (id, status) =>
    request("PATCH", `/admin/reservations/${id}`, { status }),

  getPayments: () =>
    request("GET", "/admin/payments"),

  getEnrollments: () =>
    request("GET", "/admin/enrollments"),
};
