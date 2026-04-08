import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

const SystemMonitoring = () => {
  const systemStatus = [
    { name: "API Server", status: "operational", uptime: "99.9%", responseTime: "45ms" },
    { name: "Database Connection", status: "operational", uptime: "99.95%", responseTime: "12ms" },
    { name: "Authentication Service", status: "operational", uptime: "99.8%", responseTime: "58ms" },
    { name: "Email Service", status: "operational", uptime: "99.5%", responseTime: "150ms" },
    { name: "File Storage", status: "operational", uptime: "99.7%", responseTime: "85ms" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "degraded":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "down":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">System Health Status</h1>
        <p className="text-sm text-muted-foreground">Monitor all system components and real-time metrics</p>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Overall Status</p>
                <p className="text-2xl font-bold text-green-400 mt-1">Healthy</p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Avg Response Time</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">70ms</p>
              </div>
              <Clock className="h-12 w-12 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Uptime (30d)</p>
                <p className="text-2xl font-bold text-green-400 mt-1">99.8%</p>
              </div>
              <Activity className="h-12 w-12 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemStatus.map((service, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">Response: {service.responseTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Uptime: {service.uptime}</span>
                  <Badge className={`${getStatusColor(service.status)} border`}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Logs Preview */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Recent System Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <div className="text-xs p-2 rounded border border-border/50 bg-muted/20 font-mono">
              [2026-04-08 14:32:15] ✓ Database backup completed: 2.4GB
            </div>
            <div className="text-xs p-2 rounded border border-border/50 bg-muted/20 font-mono">
              [2026-04-08 14:15:42] ✓ API health check passed
            </div>
            <div className="text-xs p-2 rounded border border-border/50 bg-muted/20 font-mono">
              [2026-04-08 14:00:01] ✓ Automated backup started
            </div>
            <div className="text-xs p-2 rounded border border-border/50 bg-muted/20 font-mono">
              [2026-04-08 13:45:30] ✓ All services verified operational
            </div>
            <div className="text-xs p-2 rounded border border-border/50 bg-muted/20 font-mono">
              [2026-04-08 13:30:15] ⚠ High CPU usage detected (78%) - resolved
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;
