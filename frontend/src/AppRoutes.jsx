import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import CourseDetails from "./pages/courses/CourseDetails";
import QuizPage from "./pages/quizzes/QuizPage";
import CommunityHub from "./pages/community/CommunityHub";
import Notifications from "./pages/notifications/Notifications";
import Materials from "./pages/materials/Materials";
import Certificates from "./pages/certificates/Certificates";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ModuleManagement from "./pages/admin/ModuleManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import CommunityManagement from "./pages/admin/CommunityManagement";
import Reports from "./pages/admin/Reports";
import ProtectedRoute from "./components/layout/ProtectedRoute";

const AppRoutes = () => (
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
        path="/quizzes"
        element={
          <ProtectedRoute roles={["student", "admin"]}>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id/quits"
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
          <CommunityHub />
        </ProtectedRoute>
      }
    />
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
      path="/admin/community"
      element={
        <ProtectedRoute roles={["admin"]}>
          <CommunityManagement />
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

export default AppRoutes;
