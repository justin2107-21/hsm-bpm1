import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Activity, Database, PlugZap, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const SystemAdminDashboard = () => {
  const navigate = useNavigate();

  const { data: profiles = [] } = useQuery({
    queryKey: ["sys_profiles_count"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id").limit(5000);
      return data || [];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["sys_roles_count"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("id, role").limit(5000);
      return data || [];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["sys_requests_count"],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("id, request_type, status").limit(5000);
      return data || [];
    },
  });

  const roleDistribution = roles.reduce((acc: Record<string, number>, r) => {
    acc[r.role] = (acc[r.role] || 0) + 1;
    return acc;
  }, {});

  const submitted = requests.filter((r) => r.status === "Submitted").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">System Administrator Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Technical control, monitoring, integrations, and database maintenance (no clinical or permit approvals).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/sys/users")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Active Users & Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">{profiles.length} profiles · {roles.length} role assignments</p>
            <p className="text-[11px] text-muted-foreground">
              {Object.entries(roleDistribution)
                .slice(0, 3)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ")}
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/users")}>
                Manage Users
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/logs")}>
                View Activity Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/sys/monitoring")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> System Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Monitoring panel and system logs</p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/monitoring")}>
                Open Monitoring Panel
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/logs")}>
                View Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/sys/requests")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Active Requests & Module Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">{submitted} submitted requests</p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/requests")}>
                View Module Logs
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/requests")}>
                Retry Failed Workflows
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/sys/database")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Backups, table status, and query analytics</p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/database")}>
                Backup / Restore
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/database")}>
                Query Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/sys/integrations")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-primary" /> Integration & API Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Map API, QR services, notifications, external connections</p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/integrations")}>
                Test API Connections
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/sys/integrations")}>
                View Integration Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;

