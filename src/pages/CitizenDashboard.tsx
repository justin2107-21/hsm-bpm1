import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import {
  QrCode, HeartPulse, Syringe, FileText, MessageSquare,
  Building2, FileCheck, Search, Activity, Calendar, Clock,
  TrendingUp, Users, Shield, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const CitizenDashboard = () => {
  const { user, currentRole, hasEstablishments, userName } = useAuth();
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
      const { data } = await supabase.from("service_requests").select("id, status, created_at, title").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["citizen_complaints_summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("sanitation_complaints").select("id, status, created_at, complaint_type").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: vaccinationSchedules = [] } = useQuery({
    queryKey: ["citizen_vax_schedules", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("vaccination_schedules").select("id, vaccine_name, scheduled_date, status").eq("user_id", user!.id).order("scheduled_date", { ascending: false }).limit(3);
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

  const activeRequests = serviceRequests.filter(r => r.status !== "completed" && r.status !== "Completed").length;
  const pendingComplaints = complaints.filter(c => c.status === "pending" || c.status === "Pending").length;
  const pendingPermits = permits.filter(p => p.status === "pending").length;
  const hasOwnedEstablishments = establishments.length > 0;

  // Get recent activity (last 5 items from all sources)
  const recentActivity = [
    ...serviceRequests.slice(0, 3).map(item => ({ ...item, type: 'service_request', date: item.created_at })),
    ...complaints.slice(0, 2).map(item => ({ ...item, type: 'complaint', date: item.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-heading">
          Welcome back, {userName?.split(' ')[0] || 'Citizen'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's your health and sanitation services overview for today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{serviceRequests.length}</div>
          <div className="text-xs text-muted-foreground">Total Requests</div>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{pendingComplaints}</div>
          <div className="text-xs text-muted-foreground">Active Complaints</div>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{vaccinationSchedules.length}</div>
          <div className="text-xs text-muted-foreground">Upcoming Vaccines</div>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{vaccinations.filter(v => v.status === 'completed').length}</div>
          <div className="text-xs text-muted-foreground">Vaccinations Done</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
            onClick={() => navigate("/citizen/health")}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <HeartPulse className="h-8 w-8 text-red-500" />
              <span className="text-sm font-medium">Request Service</span>
            </div>
          </Card>
          <Card
            className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
            onClick={() => navigate("/citizen/vaccination")}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Syringe className="h-8 w-8 text-blue-500" />
              <span className="text-sm font-medium">View Vaccines</span>
            </div>
          </Card>
          <Card
            className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
            onClick={() => navigate("/reports-complaints")}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-orange-500" />
              <span className="text-sm font-medium">File Complaint</span>
            </div>
          </Card>
          <Card
            className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
            onClick={() => navigate("/citizen/qr")}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <QrCode className="h-8 w-8 text-green-500" />
              <span className="text-sm font-medium">View QR ID</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Card className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {activity.type === 'service_request' ? (
                      <FileText className="h-4 w-4 text-blue-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-orange-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {activity.type === 'service_request' ? activity.title : `Complaint: ${activity.complaint_type}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={activity.status === 'pending' || activity.status === 'Pending' ? 'secondary' : 'default'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CitizenDashboard;
