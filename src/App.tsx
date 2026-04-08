import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import CitizenDashboard from "@/pages/CitizenDashboard";
import BhwDashboard from "@/pages/BhwDashboard";
import HealthCenterDashboard from "@/pages/staff/HealthCenterDashboard";
import InspectorDashboard from "@/pages/staff/InspectorDashboard";
import CityHealthOfficerDashboard from "@/pages/staff/CityHealthOfficerDashboard";
import LguAdminDashboard from "@/pages/staff/LguAdminDashboard";
import SystemAdminDashboard from "@/pages/staff/SystemAdminDashboard";
import HealthCenterServices from "@/pages/HealthCenterServices";
import SanitationPermit from "@/pages/SanitationPermit";
import ImmunizationTracker from "@/pages/ImmunizationTracker";
import WastewaterServices from "@/pages/WastewaterServices";
import HealthSurveillance from "@/pages/HealthSurveillance";
import CitizenAssistance from "@/pages/bhw/CitizenAssistance";
import BhwServiceRequests from "@/pages/bhw/ServiceRequests";
import BhwHealthPrograms from "@/pages/bhw/HealthPrograms";
import BhwVaccinationRequests from "@/pages/bhw/VaccinationRequests";
import BhwNutritionMonitoring from "@/pages/bhw/NutritionMonitoring";
import BhwCommunityReports from "@/pages/bhw/CommunityReports";
import BhwComplaints from "@/pages/bhw/Complaints";
import BhwBarangayHealth from "@/pages/bhw/BarangayHealth";
import StaffScanQr from "@/pages/staff/StaffScanQr";
import StaffRequests from "@/pages/staff/StaffRequests";
import StaffAssessments from "@/pages/staff/StaffAssessments";
import StaffPermitVerification from "@/pages/staff/StaffPermitVerification";
import StaffCitizenRegistration from "@/pages/staff/StaffCitizenRegistration";
import DiseaseMapDashboard from "@/pages/surveillance/DiseaseMapDashboard";
import LguRequests from "@/pages/lgu/LguRequests";
import LguVaccination from "@/pages/lgu/LguVaccination";
import LguSanitation from "@/pages/lgu/LguSanitation";
import LguAnalytics from "@/pages/lgu/LguAnalytics";
import LguInspections from "@/pages/lgu/LguInspections";
import LguCompliance from "@/pages/lgu/LguCompliance";
import SystemAdminUsers from "@/pages/sys/SystemAdminUsers";
import SystemMonitoring from "@/pages/sys/SystemMonitoring";
import SystemRequests from "@/pages/sys/SystemRequests";
import SystemIntegrations from "@/pages/sys/SystemIntegrations";
import DatabaseHealth from "@/pages/sys/DatabaseHealth";
import AuditLogs from "@/pages/sys/AuditLogs";
import SettingsPage from "@/pages/SettingsPage";
import { CitizenLoginPage } from "@/pages/CitizenLoginPage";
import { StaffLoginPage } from "@/pages/StaffLoginPage";
import NotFound from "@/pages/NotFound";
import ReportsComplaints from "@/pages/ReportsComplaints";

// Inspector pages
import AssignedInspections from "@/pages/inspector/AssignedInspections";
import InspectionSchedule from "@/pages/inspector/InspectionSchedule";
import EstablishmentList from "@/pages/inspector/EstablishmentList";
import InspectionReports from "@/pages/inspector/InspectionReports";
import ComplaintInspections from "@/pages/inspector/ComplaintInspections";
import CorrectionNotices from "@/pages/inspector/CorrectionNotices";
import ComplianceMonitoring from "@/pages/inspector/ComplianceMonitoring";
import InspectionHistory from "@/pages/inspector/InspectionHistory";

// Citizen pages
import CitizenQR from "@/pages/citizen/CitizenQR";
import HealthServices from "@/pages/citizen/HealthServices";
import HealthServicesHub from "@/pages/citizen/HealthServicesHub";
import VaccinationNutrition from "@/pages/citizen/VaccinationNutrition";
import CitizenReportsComplaints from "@/pages/citizen/CitizenReportsComplaints";
import CitizenSearchPage from "@/pages/citizen/CitizenSearchPage";
import MyEstablishments from "@/pages/citizen/MyEstablishments";
import SanitaryPermitApplication from "@/pages/citizen/SanitaryPermitApplication";
import InspectionStatus from "@/pages/citizen/InspectionStatus";
import Certificates from "@/pages/citizen/Certificates";
import Payments from "@/pages/citizen/Payments";
import ServiceRequests from "@/pages/citizen/ServiceRequests";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, roleLoading } = useAuth();
  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, roleLoading } = useAuth();
  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ProtectedRoleRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, loading, roleLoading, currentRole } = useAuth();
  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(currentRole)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RoleDashboard = () => {
  const { currentRole } = useAuth();
  const isCitizen = currentRole === "Citizen_User" || currentRole === "BusinessOwner_User";

  if (isCitizen) return <CitizenDashboard />;
  if (currentRole === "BHW_User") return <BhwDashboard />;
  if (currentRole === "Clerk_User") return <HealthCenterDashboard />;
  if (currentRole === "BSI_User") return <InspectorDashboard />;
  if (currentRole === "Captain_User") return <CityHealthOfficerDashboard />;
  if (currentRole === "LGUAdmin_User") return <LguAdminDashboard />;
  if (currentRole === "SysAdmin_User") return <SystemAdminDashboard />;

  return <Dashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public login routes */}
            <Route path="/login" element={<PublicRoute><CitizenLoginPage /></PublicRoute>} />
            <Route path="/staffadmin" element={<PublicRoute><StaffLoginPage /></PublicRoute>} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<RoleDashboard />} />
              {/* Core module routes */}
              <Route path="/health-center" element={<HealthCenterServices />} />
              <Route path="/sanitation-permit" element={<SanitationPermit />} />
              <Route path="/immunization" element={<ImmunizationTracker />} />
              <Route path="/wastewater" element={<WastewaterServices />} />
              <Route path="/surveillance" element={<HealthSurveillance />} />
              <Route path="/surveillance/map" element={<DiseaseMapDashboard />} />
              {/* Health Center Staff routes */}
              <Route path="/staff/scan-qr" element={<StaffScanQr />} />
              <Route path="/staff/requests" element={<StaffRequests />} />
              <Route path="/staff/assessments" element={<StaffAssessments />} />
              <Route path="/staff/permit-verification" element={<StaffPermitVerification />} />
              <Route path="/staff/citizen-registration" element={<StaffCitizenRegistration />} />
              <Route path="/staff/search-citizens" element={
                <ProtectedRoleRoute allowedRoles={["BHW_User", "Clerk_User", "LGUAdmin_User", "SysAdmin_User"]}>
                  <CitizenSearchPage />
                </ProtectedRoleRoute>
              } />
              {/* BHW routes */}
              <Route path="/citizen-service-assistance" element={<CitizenAssistance />} />
              {/* Backward compatibility for older links */}
              <Route path="/bhw/citizen-assistance" element={<CitizenAssistance />} />
              <Route path="/assisted-requests" element={<BhwServiceRequests />} />
              <Route path="/bhw/requests" element={<BhwServiceRequests />} />
              <Route path="/health-programs/vaccination-requests" element={<BhwVaccinationRequests />} />
              <Route path="/health-programs/nutrition-monitoring" element={<BhwNutritionMonitoring />} />
              <Route path="/bhw/health-programs" element={<BhwHealthPrograms />} />
              <Route path="/bhw/community-reports" element={<BhwCommunityReports />} />
              <Route path="/bhw/complaints" element={<BhwComplaints />} />
              <Route path="/bhw/barangay-health" element={<BhwBarangayHealth />} />
              {/* LGU Admin routes */}
              <Route path="/lgu/requests" element={<LguRequests />} />
              <Route path="/lgu/vaccination" element={<LguVaccination />} />
              <Route path="/lgu/sanitation" element={<LguSanitation />} />
              <Route path="/lgu/inspections" element={<LguInspections />} />
              <Route path="/lgu/compliance" element={<LguCompliance />} />
              <Route path="/lgu/analytics" element={<LguAnalytics />} />
              {/* System Admin routes */}
              <Route path="/sys/users" element={<SystemAdminUsers />} />
              <Route path="/sys/logs" element={<AuditLogs />} />
              <Route path="/sys/monitoring" element={<SystemMonitoring />} />
              <Route path="/sys/database" element={<DatabaseHealth />} />
              <Route path="/sys/integrations" element={<SystemIntegrations />} />
              <Route path="/sys/requests" element={<SystemRequests />} />
              {/* Inspector routes */}
              <Route path="/inspector/assigned-inspections" element={
                <ProtectedRoleRoute allowedRoles={["BSI_User"]}>
                  <AssignedInspections />
                </ProtectedRoleRoute>
              } />
              <Route path="/inspector/inspection-schedule" element={
                <ProtectedRoleRoute allowedRoles={["BSI_User"]}>
                  <InspectionSchedule />
                </ProtectedRoleRoute>
              } />
              <Route path="/inspector/establishments" element={
                <ProtectedRoleRoute allowedRoles={["BSI_User"]}>
                  <EstablishmentList />
                </ProtectedRoleRoute>
              } />
              <Route path="/inspector/inspection-reports" element={
                <ProtectedRoleRoute allowedRoles={["BSI_User"]}>
                  <InspectionReports />
                </ProtectedRoleRoute>
              } />
              <Route path="/inspector/complaint-inspections" element={
                <ProtectedRoleRoute allowedRoles={["BSI_User"]}>
                  <ComplaintInspections />
                </ProtectedRoleRoute>
              } />
              <Route path="/inspector/correction-notices" element={
                <ProtectedRoleRoute allowedRoles={["BSI_User"]}>
                  <CorrectionNotices />
                </ProtectedRoleRoute>
              } />
              <Route path="/inspector/compliance-monitoring" element={
                <ProtectedRoleRoute allowedRoles={["BSI_User"]}>
                  <ComplianceMonitoring />
                </ProtectedRoleRoute>
              } />
              <Route path="/inspector/inspection-history" element={
                <ProtectedRoleRoute allowedRoles={["BSI_User"]}>
                  <InspectionHistory />
                </ProtectedRoleRoute>
              } />
              {/* Citizen routes */}
              <Route path="/citizen/qr" element={<CitizenQR />} />
              <Route path="/citizen/health" element={<HealthServicesHub />} />
              <Route path="/citizen/vaccination" element={<VaccinationNutrition />} />
              <Route path="/citizen/disease-reporting" element={<CitizenReportsComplaints />} />
              <Route path="/citizen/sanitation-complaints" element={<CitizenReportsComplaints />} />
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
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
