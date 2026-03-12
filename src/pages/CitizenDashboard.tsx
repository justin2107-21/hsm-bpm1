import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import {
  QrCode, HeartPulse, Syringe, FileText, MessageSquare,
  Building2, FileCheck, Search, ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CitizenDashboard = () => {
  const { user, currentRole, hasEstablishments } = useAuth();
  const navigate = useNavigate();
  const citizenId = `GSMS-2026-${user?.id?.slice(0, 8).toUpperCase() || "00000000"}`;
  // Business features are available when the citizen owns at least one establishment
  const showBusinessSection = hasEstablishments;

  const { data: healthRecords = [] } = useQuery({
    queryKey: ["citizen_health_summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("resident_health_records").select("id, record_date, record_type").order("record_date", { ascending: false }).limit(3);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["citizen_vax_summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("vaccinations").select("id, vaccine, vaccination_date, status").order("vaccination_date", { ascending: false }).limit(3);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: serviceRequests = [] } = useQuery({
    queryKey: ["citizen_requests_summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("id, status").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["citizen_complaints_summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("resident_complaints").select("id, status");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: establishments = [] } = useQuery({
    queryKey: ["citizen_establishments_summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("establishments").select("id, status").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: permits = [] } = useQuery({
    queryKey: ["citizen_permits_summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("resident_permits").select("id, status");
      return data || [];
    },
    enabled: !!user && establishments.length > 0,
  });

  const activeRequests = serviceRequests.filter(r => r.status !== "completed").length;
  const pendingComplaints = complaints.filter(c => c.status === "pending").length;
  const pendingPermits = permits.filter(p => p.status === "pending").length;
  const hasOwnedEstablishments = establishments.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Citizen Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's a quick overview of your services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* QR Citizen ID */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" /> My QR Citizen ID
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="p-2 bg-card rounded-lg border border-border">
              <QRCodeSVG value={citizenId} size={80} level="H" />
            </div>
            <p className="text-xs font-mono text-muted-foreground">{citizenId}</p>
            <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => navigate("/citizen/qr")}>
              View Full QR Citizen ID <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Health Services */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary" /> Health Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {healthRecords.length > 0
                ? `${healthRecords.length} recent health records`
                : "No recent health records"}
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="w-full justify-start gap-1 text-xs" onClick={() => navigate("/citizen/health")}>
                View Health Records <ArrowRight className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vaccination */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Syringe className="h-4 w-4 text-primary" /> Vaccination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {vaccinations.length > 0
                ? `Last: ${vaccinations[0]?.vaccine} (${vaccinations[0]?.vaccination_date})`
                : "No vaccination records"}
            </p>
            <Button variant="outline" size="sm" className="w-full justify-start gap-1 text-xs" onClick={() => navigate("/citizen/vaccination")}>
              View Vaccination Records <ArrowRight className="h-3 w-3 ml-auto" />
            </Button>
          </CardContent>
        </Card>

        {/* Service Requests */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Service Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {activeRequests > 0 ? `${activeRequests} active request(s)` : "No active requests"}
            </p>
            <Button variant="outline" size="sm" className="w-full justify-start gap-1 text-xs" onClick={() => navigate("/citizen/requests")}>
              Track Requests <ArrowRight className="h-3 w-3 ml-auto" />
            </Button>
          </CardContent>
        </Card>

        {/* Sanitation Complaints */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Sanitation Complaints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {pendingComplaints > 0 ? `${pendingComplaints} pending` : "No pending complaints"}
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="w-full justify-start gap-1 text-xs" onClick={() => navigate("/citizen/sanitation-complaints")}>
                Report Complaint <ArrowRight className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Business cards - only shown based on establishments */}
        {/* Card 6 — My Establishments (visible if citizen has establishments) */}
        {hasOwnedEstablishments && (
          <>
            <Card className="glass-card border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> My Establishments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {establishments.length} registered establishment(s)
                </p>
                <div className="flex flex-col gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-1 text-xs"
                    onClick={() => navigate("/citizen/establishments")}
                  >
                    Register Establishment <ArrowRight className="h-3 w-3 ml-auto" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-1 text-xs"
                    onClick={() => navigate("/citizen/establishments")}
                  >
                    Manage Establishments <ArrowRight className="h-3 w-3 ml-auto" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 7 — Sanitary Permit (only if the user owns an establishment) */}
            <Card className="glass-card border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" /> Sanitary Permit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {pendingPermits > 0 ? `${pendingPermits} pending application(s)` : "No pending permits"}
                </p>
                <Button variant="outline" size="sm" className="w-full justify-start gap-1 text-xs" onClick={() => navigate("/citizen/sanitary-permit")}>
                  Apply for Sanitary Permit <ArrowRight className="h-3 w-3 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 8 — Inspection Updates (only when inspections exist for user establishments) */}
            <Card className="glass-card border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" /> Inspection Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Upcoming inspections and any correction notices for your establishments
                </p>
                <Button variant="outline" size="sm" className="w-full justify-start gap-1 text-xs" onClick={() => navigate("/citizen/inspections")}>
                  View Inspection Status <ArrowRight className="h-3 w-3 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
