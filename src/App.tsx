import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import CitizenDashboard from "@/pages/CitizenDashboard";
import HealthCenterServices from "@/pages/HealthCenterServices";
import SanitationPermit from "@/pages/SanitationPermit";
import ImmunizationTracker from "@/pages/ImmunizationTracker";
import WastewaterServices from "@/pages/WastewaterServices";
import HealthSurveillance from "@/pages/HealthSurveillance";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

// Citizen pages
import CitizenQR from "@/pages/citizen/CitizenQR";
import HealthServices from "@/pages/citizen/HealthServices";
import VaccinationNutrition from "@/pages/citizen/VaccinationNutrition";
import DiseaseReporting from "@/pages/citizen/DiseaseReporting";
import SanitationComplaints from "@/pages/citizen/SanitationComplaints";
import MyEstablishments from "@/pages/citizen/MyEstablishments";
import SanitaryPermitApplication from "@/pages/citizen/SanitaryPermitApplication";
import InspectionStatus from "@/pages/citizen/InspectionStatus";
import Certificates from "@/pages/citizen/Certificates";
import Payments from "@/pages/citizen/Payments";
import ServiceRequests from "@/pages/citizen/ServiceRequests";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RoleDashboard = () => {
  const { currentRole } = useAuth();
  const isCitizen = currentRole === "Citizen_User" || currentRole === "BusinessOwner_User";
  return isCitizen ? <CitizenDashboard /> : <Dashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<RoleDashboard />} />
              {/* Staff routes */}
              <Route path="/health-center" element={<HealthCenterServices />} />
              <Route path="/sanitation-permit" element={<SanitationPermit />} />
              <Route path="/immunization" element={<ImmunizationTracker />} />
              <Route path="/wastewater" element={<WastewaterServices />} />
              <Route path="/surveillance" element={<HealthSurveillance />} />
              {/* Citizen routes */}
              <Route path="/citizen/qr" element={<CitizenQR />} />
              <Route path="/citizen/health" element={<HealthServices />} />
              <Route path="/citizen/vaccination" element={<VaccinationNutrition />} />
              <Route path="/citizen/disease-reporting" element={<DiseaseReporting />} />
              <Route path="/citizen/sanitation-complaints" element={<SanitationComplaints />} />
              <Route path="/citizen/establishments" element={<MyEstablishments />} />
              <Route path="/citizen/sanitary-permit" element={<SanitaryPermitApplication />} />
              <Route path="/citizen/inspections" element={<InspectionStatus />} />
              <Route path="/citizen/certificates" element={<Certificates />} />
              <Route path="/citizen/payments" element={<Payments />} />
              <Route path="/citizen/requests" element={<ServiceRequests />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
