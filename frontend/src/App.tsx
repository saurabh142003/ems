import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useAppSelector } from "./redux/hooks";
import { getTheme } from "./theme";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Login from "./pages/Login";
import DashboardHome from "./pages/DashboardHome";
import EmployeeList from "./pages/EmployeeList";
import OrgTree from "./pages/OrgTree";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

const AppContent: React.FC = () => {
  const { darkMode } = useAppSelector((state) => state.ui);
  const theme = getTheme(darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Home - Super Admin & HR Only */}
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["Super Admin", "HR Manager"]}>
                  <DashboardHome />
                </ProtectedRoute>
              }
            />

            {/* Employee Directory - Super Admin & HR Only */}
            <Route
              path="employees"
              element={
                <ProtectedRoute allowedRoles={["Super Admin", "HR Manager"]}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />

            {/* Organization Tree - Super Admin & HR Only */}
            <Route
              path="org-tree"
              element={
                <ProtectedRoute allowedRoles={["Super Admin", "HR Manager"]}>
                  <OrgTree />
                </ProtectedRoute>
              }
            />

            {/* Profile Settings - All Roles */}
            <Route path="profile" element={<Profile />} />

            {/* 404 inside Dashboard */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
