<<<<<<< HEAD
import React, { useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import HomePage from "./pages/HomePage";
import Materials from "./pages/materials/Materials";
import Community from "./pages/community/Community";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import useAuth from "./hooks/useAuth";

const PageShell = ({ title, description, children }) => (
  <main className="min-h-screen bg-slate-50 px-6 pt-28 pb-14">
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>
      {children}
    </div>
  </main>
);

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", name: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";

  const handleSubmit = (event) => {
    event.preventDefault();
    login({
      email: form.email,
      name: form.name || form.email.split("@")[0],
    });
    navigate(redirectTo, { replace: true });
  };

  return (
    <PageShell
      title="Welcome back"
      description="Sign in to continue your learning path in EduFlow."
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="login-name">
            Name
          </label>
          <input
            id="login-name"
            type="text"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:ring"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:ring"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New to EduFlow?{" "}
        <Link to="/register" className="font-semibold text-primary">
          Register here
        </Link>
      </p>
    </PageShell>
  );
};

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    login({ name: form.name, email: form.email });
    navigate("/dashboard", { replace: true });
  };

  return (
    <PageShell
      title="Create your account"
      description="Join EduFlow LMS and start learning smarter."
    >
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="register-name">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:ring"
            placeholder="Learner name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-primary/20 transition focus:ring"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Login
        </Link>
      </p>
    </PageShell>
  );
};

const DashboardPage = () => (
  <div className="bg-slate-50 pt-28 pb-12">
    <div className="mx-auto max-w-6xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-5"
      >
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Your personalized dashboard view with materials is available below.
        </p>
      </motion.div>
      <Materials />
    </div>
  </div>
);

const CommunityPage = () => (
  <PageShell
    title="Community"
    description="Connect with peers, share insights, and collaborate on your learning goals."
  />
);

const CoursesPage = () => (
  <PageShell
    title="Cources"
    description="Browse your available learning paths and continue from where you left off."
  />
);

const QuizesPage = () => (
  <PageShell
    title="Quizes"
    description="Attempt quizzes, review your scores, and track your progress."
  />
);

const QuizAttemptPage = () => {
  const { id } = useParams();

  return (
    <PageShell
      title={`Quizes - Quiz ${id}`}
      description="Attempt quizzes, review your scores, and track your progress."
    />
  );
};

const NotificationsPage = () => (
  <PageShell
    title="Notifications"
    description="Track announcements, quiz reminders, and course updates in one place."
  />
);
=======
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import CourseDetails from './pages/courses/CourseDetails';
import QuizPage from './pages/quizzes/QuizPage';
import Community from './pages/community/Community';
import Notifications from './pages/notifications/Notifications';
import Materials from './pages/materials/Materials';
import Certificates from './pages/certificates/Certificates';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ModuleManagement from './pages/admin/ModuleManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import Reports from './pages/admin/Reports';
import ProtectedRoute from './components/layout/ProtectedRoute';
>>>>>>> Development

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <Community />
          </ProtectedRoute>
        }
      />
<<<<<<< HEAD
      <Route path="/quizes" element={<Navigate to="/quiz/1/quits" replace />} />
      <Route path="/quizzes" element={<Navigate to="/quiz/1/quits" replace />} />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route path="/notifications" element={<NotificationsPage />} />
=======
>>>>>>> Development
      <Route
        path="/materials"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <Materials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <Certificates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/modules"
        element={
          <ProtectedRoute roles={["admin"]}>
            <ModuleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DepartmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
