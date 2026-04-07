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

const Dashboard = () => {
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

  // Filter activity based on selected tab
  const getFilteredActivity = () => {
    switch (activeActivityTab) {
      case "consultations":
        return consultations.map((item: any) => ({ ...item, type: "consultation", date: item.consultation_date }));
      case "surveillance":
        return surveilCases.map((item: any) => ({ ...item, type: "surveillance", date: item.case_date }));
      case "permits":
        return permits.map((item: any) => ({ ...item, type: "permit", date: item.application_date }));
      default:
        return recentActivity;
    }
  };

  const filteredActivity = getFilteredActivity();

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner - Blue for Health Center Staff */}
      <div className="bg-blue-700 dark:bg-blue-750 rounded-xl p-8 text-white shadow-lg">
        <p className="text-sm font-medium opacity-90">Health Center Portal</p>
        <h1 className="text-3xl font-bold mt-1 mb-2">Welcome back, {userName?.split(" ")[0] || "Staff"}!</h1>
        <p className="text-sm opacity-90 mb-4">
          You have {activeConsultations + activeSurveilCases + pendingPermits} active items that need your attention.
        </p>
        <Button
          onClick={() => setActiveActivityTab("all")}
          className="bg-white text-blue-600 hover:bg-blue-50 font-medium"
        >
          View All Activities
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto mb-3">
            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{consultations.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Consultations</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">+{activeConsultations} active</div>
        </Card>

        <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold">{surveilCases.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Disease Cases</div>
          <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">{activeSurveilCases} active</div>
        </Card>

        <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-3">
            <Syringe className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold">{vaccinations.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Vaccination Records</div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">{vaccinationsDone} completed</div>
        </Card>

        <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mx-auto mb-3">
            <ClipboardCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold">{permits.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Permits</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">{pendingPermits} pending</div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Activity</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { id: "all", label: "All" },
            { id: "consultations", label: "Consultations" },
            { id: "surveillance", label: "Disease Cases" },
            { id: "permits", label: "Permits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveActivityTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeActivityTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <Card className="border-0 shadow-sm p-0 divide-y">
          {filteredActivity.length > 0 ? (
            <div>
              {filteredActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {activity.type === "consultation" ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                            <Stethoscope className="h-5 w-5 text-blue-600 dark:text-white" />
                          </div>
                        ) : activity.type === "surveillance" ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-white" />
                          </div>
                        ) : activity.type === "vaccination" ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                            <Syringe className="h-5 w-5 text-green-600 dark:text-white" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                            <FileText className="h-5 w-5 text-orange-600 dark:text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === "consultation"
                            ? `Consultation: ${activity.patient_name}`
                            : activity.type === "surveillance"
                            ? `Disease: ${activity.disease}`
                            : activity.type === "vaccination"
                            ? `Vaccine: ${activity.vaccine}`
                            : `Permit: ${activity.business_name}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`group-hover:bg-opacity-80 transition-all ${
                        activity.status === "pending" || activity.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : activity.status === "active" || activity.status === "Active"
                          ? "bg-blue-100 text-blue-800"
                          : activity.status === "completed" || activity.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      variant="outline"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No {activeActivityTab === "all" ? "" : activeActivityTab} activity yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      {isCaptain && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Captain Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate("/health-center")}
            >
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Consultations</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate("/surveillance")}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Disease Monitoring</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate("/sanitation-permit")}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Permits</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate("/immunization")}
            >
              <Syringe className="h-4 w-4" />
              <span className="hidden sm:inline">Vaccinations</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
