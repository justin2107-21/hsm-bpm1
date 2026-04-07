import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  QrCode, HeartPulse, Syringe, FileText, MessageSquare,
  Building2, FileCheck, Search, Activity, Calendar, Clock,
  TrendingUp, Users, Shield, AlertCircle, CreditCard, File,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

const CitizenDashboard = () => {
  const { user, currentRole, hasEstablishments, userName } = useAuth();
  const navigate = useNavigate();
  const [activeActivityTab, setActiveActivityTab] = useState<"all" | "requests" | "payments" | "complaints">("all");
  
  // Enable real-time notifications for citizen
  useRealtimeNotifications(user?.id);
  
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
      const { data } = await supabase.from("service_requests").select("id, status, created_at, title").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["citizen_complaints_summary", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("sanitation_complaints").select("complaint_id as id, status, created_at, complaint_type").eq("citizen_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: vaccinationSchedules = [] } = useQuery({
    queryKey: ["citizen_vax_schedules", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("vaccinations").select("id, vaccine, vaccination_date").order("vaccination_date", { ascending: false }).limit(3);
      return (data || []).map(item => ({ ...item, vaccine_name: item.vaccine, scheduled_date: item.vaccination_date, status: 'scheduled' }));
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
      const { data } = await supabase.from("resident_permits").select("id, status, created_at");
      return data || [];
    },
    enabled: !!user && establishments.length > 0,
  });

  const activeRequests = serviceRequests.filter(r => r.status !== "completed" && r.status !== "Completed").length;
  const pendingComplaints = complaints.filter(c => c.status === "pending" || c.status === "Pending").length;
  const pendingPermits = permits.filter(p => p.status === "pending").length;
  const hasOwnedEstablishments = establishments.length > 0;

  // Get recent activity (last 5 items from all sources)
  const recentActivity = [
    ...serviceRequests.slice(0, 3).map(item => ({ ...item, type: 'service_request', date: item.created_at })),
    ...complaints.slice(0, 2).map(item => ({ ...item, type: 'complaint', date: item.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const upcomingVaccineSchedule = vaccinationSchedules.length > 0 ? vaccinationSchedules[0] : null;
  const nextVaccineDate = upcomingVaccineSchedule?.scheduled_date 
    ? new Date(upcomingVaccineSchedule.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : "TBD";

  // Filter activity based on selected tab
  const getFilteredActivity = () => {
    switch(activeActivityTab) {
      case "requests":
        return serviceRequests.slice(0, 5).map(item => ({ ...item, type: 'service_request', date: item.created_at }));
      case "complaints":
        return complaints.slice(0, 5).map(item => ({ ...item, type: 'complaint', date: item.created_at }));
      case "payments":
        return permits.slice(0, 5).map(item => ({ ...item, type: 'payment', date: item.created_at }));
      default:
        return recentActivity;
    }
  };

  const filteredActivity = getFilteredActivity();

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="bg-emerald-700 dark:bg-emerald-750 rounded-xl p-8 text-white shadow-lg">
        <p className="text-sm font-medium opacity-90">Good Day!</p>
        <h1 className="text-3xl font-bold mt-1 mb-2">Welcome back, {userName?.split(' ')[0] || 'Citizen'}!</h1>
        <p className="text-sm opacity-90 mb-4">You have {activeRequests + pendingComplaints} pending actions that need your attention.</p>
        <Button 
          onClick={() => setActiveActivityTab("all")}
          className="bg-white text-emerald-600 hover:bg-emerald-50 font-medium"
        >
          View Pending Actions
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 mx-auto mb-3">
            <FileText className="h-6 w-6 text-teal-600" />
          </div>
          <div className="text-2xl font-bold">{serviceRequests.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Requests</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">+{activeRequests} this month</div>
        </Card>

        <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-3">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="text-2xl font-bold">{pendingComplaints}</div>
          <div className="text-xs text-muted-foreground mt-1">Active Complaints</div>
          <div className="text-xs text-amber-600 font-medium mt-1">{pendingComplaints} pending review</div>
        </Card>

        <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-3">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{vaccinationSchedules.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Upcoming Vaccines</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Next {nextVaccineDate}</div>
        </Card>

        <Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mx-auto mb-3">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">{vaccinations.filter(v => v.status === 'completed').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Vaccinations Done</div>
          <div className="text-xs text-purple-600 font-medium mt-1">All up to date</div>
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
            { id: "requests", label: "Requests" },
            { id: "payments", label: "Payments" },
            { id: "complaints", label: "Complaints" }
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
                        {activity.type === 'service_request' ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                        ) : activity.type === 'payment' ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                            <CreditCard className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                            <MessageSquare className="h-5 w-5 text-orange-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'service_request' 
                            ? activity.title 
                            : activity.type === 'payment'
                            ? `Fee Payment`
                            : `Complaint: ${activity.complaint_type}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`group-hover:bg-opacity-80 transition-all ${
                        activity.status === 'pending' || activity.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : activity.status === 'approved' || activity.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
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
              <p className="text-sm">No {activeActivityTab === 'all' ? '' : activeActivityTab} activity yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CitizenDashboard;
