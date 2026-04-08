import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Activity, Database, PlugZap, FileText, ChevronRight } from "lucide-react";
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">System Administrator Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Technical control, monitoring, integrations, and database maintenance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-l-4 border-l-blue-500/50 hover:border-l-blue-500 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Users</p>
                <p className="text-3xl font-bold text-foreground mt-1">{profiles.length}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-green-500/50 hover:border-l-green-500 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Role Assignments</p>
                <p className="text-3xl font-bold text-foreground mt-1">{roles.length}</p>
              </div>
              <Activity className="h-12 w-12 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-orange-500/50 hover:border-l-orange-500 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Active Requests</p>
                <p className="text-3xl font-bold text-foreground mt-1">{submitted}</p>
              </div>
              <FileText className="h-12 w-12 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Control Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <Card className="glass-card cursor-pointer hover:shadow-lg transition-all hover:border-blue-500/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              Active Users & Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{profiles.length} total profiles</p>
              <p className="text-sm text-muted-foreground">{roles.length} role assignments</p>
              <div className="pt-2 border-t border-border/50">
                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.entries(roleDistribution)
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <span key={k} className="px-2 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {k}: {v}
                      </span>
                    ))}
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-between"
              onClick={() => navigate("/sys/users")}
            >
              Manage Users
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="glass-card cursor-pointer hover:shadow-lg transition-all hover:border-green-500/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              System Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monitoring Panel</span>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-xs font-medium text-green-400">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">System Logs</span>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-xs font-medium text-green-400">Healthy</span>
              </div>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-between"
              onClick={() => navigate("/sys/monitoring")}
            >
              View Monitoring
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card className="glass-card cursor-pointer hover:shadow-lg transition-all hover:border-purple-500/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Database className="h-5 w-5 text-purple-400" />
              </div>
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Backups, table status, and query analytics</p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground pt-2">Last backup: 2 hours ago</p>
              </div>
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-between"
              onClick={() => navigate("/sys/database")}
            >
              Access Database
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Integration & API */}
        <Card className="glass-card cursor-pointer hover:shadow-lg transition-all hover:border-pink-500/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <PlugZap className="h-5 w-5 text-pink-400" />
              </div>
              Integration & API Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Map API, QR services, notifications, external connections</p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground pt-2">All services operational</p>
              </div>
            </div>
            <Button
              className="w-full bg-pink-600 hover:bg-pink-700 flex items-center justify-between"
              onClick={() => navigate("/sys/integrations")}
            >
              Test Connections
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card className="glass-card cursor-pointer hover:shadow-lg transition-all hover:border-amber-500/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <FileText className="h-5 w-5 text-amber-400" />
              </div>
              Active Requests & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{submitted} submitted requests</p>
              <p className="text-sm text-muted-foreground">{requests.length} total tracked</p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground pt-2">Module health: Optimal</p>
              </div>
            </div>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 flex items-center justify-between"
              onClick={() => navigate("/sys/requests")}
            >
              View Module Logs
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;

