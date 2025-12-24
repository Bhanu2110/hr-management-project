import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Salary from "./pages/Salary";
import LeaveRequests from "./pages/LeaveRequests";
import Reports from "./pages/Reports";
import SalarySlips from "./pages/SalarySlips";
import Form16 from "./pages/Form16";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Payroll from "./pages/Payroll"; // Import the new Payroll component
import Holidays from "./pages/Holidays";
import AdminHolidays from "./pages/AdminHolidays";
import NotFound from "./pages/NotFound";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

// Component to handle root redirection based on role
function RootRedirector() {
  const { employee } = useAuth();

  // If the role is admin, redirect to the admin dashboard
  if (employee?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Otherwise, redirect to the employee dashboard
  return <Navigate to="/employee/dashboard" replace />;
}


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RootRedirector />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute requireAdmin>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <ProtectedRoute requireAdmin>
                  <Salary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave-requests"
              element={
                <ProtectedRoute>
                  <LeaveRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute requireAdmin>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requireAdmin>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary-slips"
              element={
                <ProtectedRoute>
                  <SalarySlips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/leave-requests"
              element={
                <ProtectedRoute>
                  <LeaveRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/form-16"
              element={
                <ProtectedRoute>
                  <Form16 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Notifications />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/holidays"
              element={
                <ProtectedRoute>
                  <Holidays />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/holidays"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminHolidays />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
