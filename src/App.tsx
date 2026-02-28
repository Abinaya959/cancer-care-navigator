import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { RoleProvider } from "@/lib/role-context";
import { DataProvider } from "@/lib/data-context";
import Layout from "@/components/Layout";
import RoleRoute from "@/components/RoleRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import HealthWorkerDashboard from "./pages/HealthWorkerDashboard";
import PublicDashboard from "./pages/PublicDashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import HeatmapDashboard from "./pages/HeatmapDashboard";
import HospitalPerformance from "./pages/HospitalPerformance";
import Simulator from "./pages/Simulator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><RoleRoute allowed={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
    <Route path="/doctor" element={<ProtectedRoute><RoleRoute allowed={['doctor']}><DoctorDashboard /></RoleRoute></ProtectedRoute>} />
    <Route path="/health-worker" element={<ProtectedRoute><RoleRoute allowed={['health_worker']}><HealthWorkerDashboard /></RoleRoute></ProtectedRoute>} />
    <Route path="/public" element={<ProtectedRoute><RoleRoute allowed={['public_user']}><PublicDashboard /></RoleRoute></ProtectedRoute>} />
    <Route path="/patients" element={<ProtectedRoute><RoleRoute allowed={['admin', 'doctor']}><Patients /></RoleRoute></ProtectedRoute>} />
    <Route path="/patient/:id" element={<ProtectedRoute><RoleRoute allowed={['admin', 'doctor']}><PatientDetail /></RoleRoute></ProtectedRoute>} />
    <Route path="/heatmap" element={<ProtectedRoute><RoleRoute allowed={['admin', 'doctor', 'health_worker']}><HeatmapDashboard /></RoleRoute></ProtectedRoute>} />
    <Route path="/hospitals" element={<ProtectedRoute><RoleRoute allowed={['admin', 'doctor']}><HospitalPerformance /></RoleRoute></ProtectedRoute>} />
    <Route path="/simulator" element={<ProtectedRoute><RoleRoute allowed={['admin']}><Simulator /></RoleRoute></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RoleProvider>
          <DataProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </DataProvider>
        </RoleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
