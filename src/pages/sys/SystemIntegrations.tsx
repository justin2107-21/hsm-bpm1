import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Database, Mail, Bell, Map, BarChart3, RefreshCw } from "lucide-react";

const SystemIntegrations = () => {
  const integrations = [
    {
      name: "Email Service",
      provider: "SMTP",
      status: "operational",
      lastCheck: "2026-04-08 14:55",
      responseTime: "245ms",
      uptime: "99.9%",
      icon: Mail,
    },
    {
      name: "SMS Gateway",
      provider: "Twilio",
      status: "operational",
      lastCheck: "2026-04-08 14:50",
      responseTime: "320ms",
      uptime: "99.5%",
      icon: Bell,
    },
    {
      name: "QR Code Service",
      provider: "QR API",
      status: "operational",
      lastCheck: "2026-04-08 14:52",
      responseTime: "150ms",
      uptime: "99.8%",
      icon: BarChart3,
    },
    {
      name: "Maps Integration",
      provider: "Google Maps API",
      status: "degraded",
      lastCheck: "2026-04-08 14:48",
      responseTime: "580ms",
      uptime: "98.2%",
      icon: Map,
    },
    {
      name: "Database Sync",
      provider: "Supabase",
      status: "operational",
      lastCheck: "2026-04-08 14:55",
      responseTime: "95ms",
      uptime: "99.99%",
      icon: Database,
    },
    {
      name: "Web Hooks",
      provider: "Internal",
      status: "operational",
      lastCheck: "2026-04-08 14:54",
      responseTime: "110ms",
      uptime: "99.7%",
      icon: Network,
    },
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

  const getStatusDot = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500 animate-pulse";
      case "degraded":
        return "bg-yellow-500 animate-pulse";
      case "down":
        return "bg-red-500 animate-pulse";
      default:
        return "bg-gray-500";
    }
  };

  const operationalCount = integrations.filter(i => i.status === "operational").length;
  const degradedCount = integrations.filter(i => i.status === "degraded").length;
  const downCount = integrations.filter(i => i.status === "down").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Integration Status</h1>
        <p className="text-sm text-muted-foreground">Monitor all external service integrations and API connections</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Operational</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{operationalCount}</p>
              </div>
              <div className={`h-12 w-12 rounded-full ${getStatusDot("operational")} opacity-30`}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Degraded</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{degradedCount}</p>
              </div>
              <div className={`h-12 w-12 rounded-full ${getStatusDot("degraded")} opacity-30`}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Down</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{downCount}</p>
              </div>
              <div className={`h-12 w-12 rounded-full ${getStatusDot("down")} opacity-30`}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration, idx) => {
          const IconComponent = integration.icon;
          return (
            <Card key={idx} className="glass-card hover:border-white/20 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{integration.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{integration.provider}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(integration.status)} border text-xs`}>
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="font-mono text-foreground">{integration.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime (30d):</span>
                    <span className="font-mono text-foreground">{integration.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Check:</span>
                    <span className="font-mono text-muted-foreground text-xs">{integration.lastCheck}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="w-full h-8 text-xs mt-2">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Check Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connection Issues Alert */}
      <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">⚠️ Connection Issues</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• Maps API showing elevated response time (580ms) - Check rate limits or service status</p>
          <p>• All other integrations performing normally</p>
          <p>• Last comprehensive check: 2026-04-08 14:55:00 UTC</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemIntegrations;
