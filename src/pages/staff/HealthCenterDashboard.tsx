import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Stethoscope,
  Syringe,
  AlertTriangle,
  ClipboardCheck,
  Activity,
  TrendingUp,
  FileText,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const HealthCenterDashboard = () => {
  const { user, userName, currentRole } = useAuth();
  const navigate = useNavigate();
  const [activeActivityTab, setActiveActivityTab] = useState<"all" | "consultations" | "surveillance" | "permits">("all");
  const isCaptain = currentRole === "Captain_User";

  const { data: consultations = [] } = useQuery({
    queryKey: ["dashboard_consultations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select("id, patient_name, status, consultation_date, diagnosis")
        .order("consultation_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: surveilCases = [] } = useQuery({
    queryKey: ["dashboard_surveillance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveillance_cases")
        .select("id, disease, status, case_date")
        .order("case_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["dashboard_vaccinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vaccinations")
        .select("id, vaccine, vaccination_date, status")
        .order("vaccination_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: permits = [] } = useQuery({
    queryKey: ["dashboard_permits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sanitation_permits")
        .select("id, business_name, status, application_date")
        .order("application_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const activeConsultations = consultations.filter(
    (c: any) => c.status === "active" || c.status === "Active"
  ).length;
  const activeSurveilCases = surveilCases.filter(
    (c: any) => c.status === "active" || c.status === "Active"
  ).length;
  const pendingPermits = permits.filter(
    (p: any) => p.status === "pending" || p.status === "Pending"
  ).length;
  const vaccinationsDone = vaccinations.filter(
    (v: any) => v.status === "completed" || v.status === "Completed"
  ).length;

  // Get recent activity from all sources
  const recentActivity = [
    ...consultations.map((item: any) => ({ ...item, type: "consultation", date: item.consultation_date })),
    ...surveilCases.map((item: any) => ({ ...item, type: "surveillance", date: item.case_date })),
    ...vaccinations.map((item: any) => ({ ...item, type: "vaccination", date: item.vaccination_date })),
    ...permits.map((item: any) => ({ ...item, type: "permit", date: item.application_date })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Filter activities by selected tab
  const filteredActivity = recentActivity.filter((item: any) => {
    if (activeActivityTab === "all") return true;
    return item.type === activeActivityTab;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4 text-blue-600 dark:text-white" />;
      case "surveillance":
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-white" />;
      case "vaccination":
        return <Syringe className="h-4 w-4 text-green-600 dark:text-white" />;
      case "permit":
        return <ClipboardCheck className="h-4 w-4 text-purple-600 dark:text-white" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityTitle = (item: any) => {
    switch (item.type) {
      case "consultation":
        return `Consultation: ${item.patient_name || "N/A"}`;
      case "surveillance":
        return `Disease Case: ${item.disease || "N/A"}`;
      case "vaccination":
        return `Vaccination: ${item.vaccine || "N/A"}`;
      case "permit":
        return `Permit: ${item.business_name || "N/A"}`;
      default:
        return "Activity";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-blue-700 dark:bg-blue-750 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mt-1 mb-2">Welcome back, {userName?.split(" ")[0]}!</h1>
        <p className="text-sm opacity-90 mb-4">You have {filteredActivity.length} active items that need attention.</p>
        <Button className="bg-white text-blue-600 hover:bg-blue-50 font-medium">View All Activities</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto mb-3">
            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-center">{activeConsultations}</div>
          <div className="text-xs text-muted-foreground mt-1 text-center">Consultations</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1 text-center">+{Math.max(0, activeConsultations - 2)} active</div>
        </Card>

        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-center">{activeSurveilCases}</div>
          <div className="text-xs text-muted-foreground mt-1 text-center">Disease Cases</div>
          <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1 text-center">+{activeSurveilCases} active</div>
        </Card>

        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-3">
            <Syringe className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-center">{vaccinationsDone}</div>
          <div className="text-xs text-muted-foreground mt-1 text-center">Vaccination Records</div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 text-center">+{vaccinationsDone} completed</div>
        </Card>

        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mx-auto mb-3">
            <ClipboardCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-center">{pendingPermits}</div>
          <div className="text-xs text-muted-foreground mt-1 text-center">Permits</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1 text-center">+{pendingPermits} pending</div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          
          {/* Activity Tabs */}
          <div className="flex gap-2 border-b mb-4 overflow-x-auto">
            {[
              { id: "all" as const, label: "All" },
              { id: "consultations" as const, label: "Consultations" },
              { id: "surveillance" as const, label: "Disease Cases" },
              { id: "permits" as const, label: "Permits" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveActivityTab(tab.id)}
                className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeActivityTab === tab.id ? "border-blue-500 text-blue-600 dark:text-white" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Activity List */}
          <div className="space-y-2">
            {filteredActivity.map((item: any) => (
              <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getActivityIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{getActivityTitle(item)}</p>
                      <Badge className={`text-xs ${getStatusColor(item.status)}`}>{item.status || "Unknown"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activities found</p>}
          </div>
        </div>
      </div>

      {/* Captain-only Quick Actions */}
      {isCaptain && (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold mb-4 text-sm text-blue-900 dark:text-blue-100">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={() => navigate("/health-center")} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Review Consultations
            </Button>
            <Button onClick={() => navigate("/surveillance")} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Manage Cases
            </Button>
            <Button onClick={() => navigate("/sanitation-permit")} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Review Permits
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCenterDashboard;

