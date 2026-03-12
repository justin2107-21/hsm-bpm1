import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, ShieldAlert, Syringe, Building2, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CityHealthOfficerDashboard = () => {
  const navigate = useNavigate();

  const { data: permits = [] } = useQuery({
    queryKey: ["cho_permits"],
    queryFn: async () => {
      const { data } = await supabase.from("sanitation_permits").select("id, status").limit(200);
      return data || [];
    },
  });

  const pendingApprovals = permits.filter((p) => p.status === "Approved").length;
  const pendingReview = permits.filter((p) => p.status === "pending" || p.status === "Under Review").length;

  const { data: cases = [] } = useQuery({
    queryKey: ["cho_surveillance_cases"],
    queryFn: async () => {
      const { data } = await supabase.from("surveillance_cases").select("id, status, case_date").limit(200);
      return data || [];
    },
  });

  const activeCases = cases.filter((c) => c.status === "active").length;

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["cho_vaccinations"],
    queryFn: async () => {
      const { data } = await supabase.from("vaccinations").select("id").limit(200);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">City Health Officer Dashboard</h1>
        <p className="text-sm text-muted-foreground">Municipal health oversight, permit authority, and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/sanitation-permit")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" /> Sanitation Permit Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {pendingReview} awaiting review · {pendingApprovals} ready for final action
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sanitation-permit")}>
                Review Applications
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sanitation-permit")}>
                Approve Permits
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/surveillance")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" /> Disease Surveillance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">{activeCases} active cases being monitored</p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/surveillance")}>
                Open Disease Monitoring
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/surveillance/map")}>
                View Disease Map
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/immunization")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Syringe className="h-4 w-4 text-primary" /> Vaccination Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">{vaccinations.length} records across programs</p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/immunization")}>
                View Vaccination Statistics
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/immunization")}>
                View Immunization Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/sanitation-permit")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Establishment Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Monitor compliance outcomes and re-inspection status</p>
            <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sanitation-permit")}>
              View Compliance Monitoring
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/health-center")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" /> Health Center Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Clinic activity and operational statistics</p>
            <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/health-center")}>
              View Health Center Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CityHealthOfficerDashboard;

