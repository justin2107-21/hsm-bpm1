import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Syringe,
  ShieldAlert,
  ClipboardList,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const BhwDashboard = () => {
  const { user, userName } = useAuth();
  const navigate = useNavigate();
  const [activeActivityTab, setActiveActivityTab] = useState<"all" | "vaccinations" | "disease" | "complaints">("all");

  const { data: vaccinationRequests = [] } = useQuery({
    queryKey: ["bhw_vaccination_requests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vaccinations")
        .select("id, vaccine, vaccination_date, status")
        .order("vaccination_date", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: diseaseReports = [] } = useQuery({
    queryKey: ["bhw_disease_reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("surveillance_cases")
        .select("id, disease, case_date, status")
        .order("case_date", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["bhw_sanitation_complaints"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("sanitation_complaints")
        .select("complaint_id as id, complaint_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: serviceRequests = [] } = useQuery({
    queryKey: ["bhw_service_requests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("id, status, created_at, title")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const pendingVaccinations = vaccinationRequests.filter(
    (v: any) => v.status === "scheduled" || v.status === "pending"
  ).length;
  const activeDiseaseCases = diseaseReports.filter(
    (d: any) => d.status === "active" || d.status === "pending"
  ).length;
  const pendingComplaints = complaints.filter(
    (c: any) => c.status === "pending" || c.status === "Pending"
  ).length;

  // Get recent activity from all sources
  const recentActivity = [
    ...vaccinationRequests.map((item: any) => ({ ...item, type: "vaccination", date: item.vaccination_date })),
    ...diseaseReports.map((item: any) => ({ ...item, type: "disease", date: item.case_date })),
    ...complaints.map((item: any) => ({ ...item, type: "complaint", date: item.created_at })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Filter activity based on selected tab
  const getFilteredActivity = () => {
    switch (activeActivityTab) {
      case "vaccinations":
        return vaccinationRequests.map((item: any) => ({ ...item, type: "vaccination", date: item.vaccination_date }));
      case "disease":
        return diseaseReports.map((item: any) => ({ ...item, type: "disease", date: item.case_date }));
      case "complaints":
        return complaints.map((item: any) => ({ ...item, type: "complaint", date: item.created_at }));
      default:
        return recentActivity;
    }
  };

  const filteredActivity = getFilteredActivity();

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="bg-emerald-700 dark:bg-emerald-750 rounded-xl p-8 text-white shadow-lg">
        <p className="text-sm font-medium opacity-90">Health Worker Portal</p>
        <h1 className="text-3xl font-bold mt-1 mb-2">Welcome back, {userName?.split(" ")[0] || "Health Worker"}!</h1>
        <p className="text-sm opacity-90 mb-4">
          You have {pendingVaccinations + activeDiseaseCases + pendingComplaints} active cases requiring attention.
        </p>
        <Button
          onClick={() => setActiveActivityTab("all")}
          className="bg-white text-emerald-600 hover:bg-emerald-50 font-medium"
        >
          View All Activities
        </Button>
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
            { id: "vaccinations", label: "Vaccinations" },
            { id: "disease", label: "Disease Cases" },
            { id: "complaints", label: "Complaints" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveActivityTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeActivityTab === tab.id
                  ? "border-emerald-500 text-emerald-600"
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
                        {activity.type === "vaccination" ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                            <Syringe className="h-5 w-5 text-blue-600 dark:text-white" />
                          </div>
                        ) : activity.type === "disease" ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-white" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                            <MessageSquare className="h-5 w-5 text-orange-600 dark:text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === "vaccination"
                            ? `Vaccine: ${activity.vaccine}`
                            : activity.type === "disease"
                            ? `Disease: ${activity.disease}`
                            : `Complaint: ${activity.complaint_type}`}
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
                          : activity.status === "active"
                          ? "bg-orange-100 text-orange-800"
                          : activity.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
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

      {/* Quick Action Buttons */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/bhw/health-programs")}
          >
            <Syringe className="h-4 w-4" />
            <span className="hidden sm:inline">Vaccination Programs</span>
            <span className="sm:hidden">Vaccinations</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/bhw/community-reports")}
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Disease Monitoring</span>
            <span className="sm:hidden">Disease</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/bhw/complaints")}
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Sanitation Issues</span>
            <span className="sm:hidden">Complaints</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/bhw/requests")}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Service Requests</span>
            <span className="sm:hidden">Requests</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/bhw/barangay-health")}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Barangay Health</span>
            <span className="sm:hidden">Health Data</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/bhw/nutrition-monitoring")}
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Nutrition Monitor</span>
            <span className="sm:hidden">Nutrition</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BhwDashboard;

