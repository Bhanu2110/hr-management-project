import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
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

// Component to handle dashboard routing based on role
function DashboardRouter() {
  const { isAdmin, isEmployee } = useAuth();
  
  if (isAdmin) {
    return <AdminDashboard />;
  } else if (isEmployee) {
    // Redirect employees directly to Form 16 page
    return <EmployeeDashboard />;
  }
  
  return <Navigate to="/auth" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
