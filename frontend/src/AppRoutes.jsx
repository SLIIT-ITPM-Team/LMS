import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import CourseDetails from "./pages/courses/CourseDetails";
import CourseView from "./pages/courses/CourseView";
import StudentCourses from "./pages/student/StudentCourses";
import ManageCourses from "./pages/admin/ManageCourses";
import QuizPage from "./pages/quizzes/QuizPage";
import CommunityHub from "./pages/community/CommunityHub";
import Notifications from "./pages/notifications/Notifications";
import Materials from "./pages/materials/Materials";
import LectureNotesDepartments from "./pages/materials/LectureNotesDepartments";
import LectureNotesDepartment from "./pages/materials/LectureNotesDepartment";
import ModelPapersDepartment from "./pages/materials/ModelPapersDepartment";
import PastPapersDepartment from "./pages/materials/PastPapersDepartment";
import QuickSummary from "./pages/materials/QuickSummary";
import ShortNotesDepartment from "./pages/materials/ShortNotesDepartment";
import Certificates from "./pages/certificates/Certificates";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ModuleManagement from "./pages/admin/ModuleManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import CommunityManagement from "./pages/admin/CommunityManagement";
import Reports from "./pages/admin/Reports";
import QuizAdmin from "./pages/admin/QuizAdmin";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";

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
          <CourseView />
        </ProtectedRoute>
      }
    />
    <Route
      path="/student/courses"
      element={
        <ProtectedRoute roles={["student"]}>
          <StudentCourses />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/courses"
      element={
        <ProtectedRoute roles={["admin"]}>
          <ManageCourses />
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
      path="/materials/quick-summary"
      element={
        <ProtectedRoute roles={["student", "admin"]}>
          <QuickSummary />
        </ProtectedRoute>
      }
    />
    <Route
      path="/materials/lecture-notes"
      element={
        <ProtectedRoute roles={["student", "admin"]}>
          <LectureNotesDepartments />
        </ProtectedRoute>
      }
    />
    <Route
      path="/materials/lecture-notes/:department"
      element={
        <ProtectedRoute roles={["student", "admin"]}>
          <LectureNotesDepartment />
        </ProtectedRoute>
      }
    />
    <Route
      path="/materials/past-papers/:department"
      element={
        <ProtectedRoute roles={["student", "admin"]}>
          <PastPapersDepartment />
        </ProtectedRoute>
      }
    />
    <Route
      path="/materials/model-papers/:department"
      element={
        <ProtectedRoute roles={["student", "admin"]}>
          <ModelPapersDepartment />
        </ProtectedRoute>
      }
    />
    <Route
      path="/materials/short-notes/:department"
      element={
        <ProtectedRoute roles={["student", "admin"]}>
          <ShortNotesDepartment />
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
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="courses" element={<ManageCourses />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="modules" element={<ModuleManagement />} />
      <Route path="departments" element={<DepartmentManagement />} />
      <Route path="quiz" element={<QuizAdmin />} />
      <Route path="community" element={<CommunityManagement />} />
      <Route path="reports" element={<Reports />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
