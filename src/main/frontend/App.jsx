import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Enrollments from './pages/Enrollments';
import Reservations from './pages/Reservations';
import Payments from './pages/Payments';
import { isAuthenticated, getRole } from './lib/auth';

/** Redirect to /login if not authenticated */
function RequireAuth({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

/**
 * Redirect to / (dashboard) if the current role is not in the allowed list.
 * This enforces client-side role-based routing.
 */
function RequireRole({ roles, children }) {
    const role = getRole();
    if (!roles.includes(role)) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route
                    path="/login"
                    element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
                />

                {/* Protected — all roles */}
                <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
                    <Route index element={<Dashboard />} />

                    {/* Admin only */}
                    <Route
                        path="users"
                        element={<RequireRole roles={["admin"]}><Users /></RequireRole>}
                    />

                    {/* All roles */}
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:id" element={<CourseDetail />} />

                    {/* Student + Instructor + Admin */}
                    <Route path="enrollments" element={<Enrollments />} />

                    {/* Student + Admin only */}
                    <Route
                        path="reservations"
                        element={<RequireRole roles={["student", "admin"]}><Reservations /></RequireRole>}
                    />
                    <Route
                        path="payments"
                        element={<RequireRole roles={["student", "admin"]}><Payments /></RequireRole>}
                    />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
