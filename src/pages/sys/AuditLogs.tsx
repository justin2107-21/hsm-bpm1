import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, LogIn, FileText, Edit3, Trash2, Download, Filter } from "lucide-react";
import { useState } from "react";

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const logs = [
    { id: "LOG-8934", user: "admin@hsm.local", action: "login", resource: "System", timestamp: "2026-04-08 14:55:23", ip: "192.168.1.100", status: "success", details: "Admin login successful" },
    { id: "LOG-8933", user: "maria.santos@citizen.local", action: "data_access", resource: "health_records", timestamp: "2026-04-08 14:52:10", ip: "192.168.1.105", status: "success", details: "Accessed personal health record" },
    { id: "LOG-8932", user: "inspector@health.local", action: "edit", resource: "service_request", timestamp: "2026-04-08 14:48:45", ip: "192.168.1.110", status: "success", details: "Updated service request REQ-1234" },
    { id: "LOG-8931", user: "staff@center.local", action: "create", resource: "assessment", timestamp: "2026-04-08 14:32:18", ip: "192.168.1.115", status: "success", details: "Created health assessment" },
    { id: "LOG-8930", user: "admin@hsm.local", action: "export", resource: "reports", timestamp: "2026-04-08 14:15:32", ip: "192.168.1.100", status: "success", details: "Exported monthly health report" },
    { id: "LOG-8929", user: "unknown", action: "login", resource: "System", timestamp: "2026-04-08 13:45:22", ip: "203.192.45.89", status: "failed", details: "Invalid credentials - potential intrusion attempt" },
    { id: "LOG-8928", user: "health.officer@lgu.local", action: "data_access", resource: "vaccination_records", timestamp: "2026-04-08 13:30:15", ip: "192.168.1.120", status: "success", details: "Accessed vaccination database" },
    { id: "LOG-8927", user: "admin@hsm.local", action: "delete", resource: "test_record", timestamp: "2026-04-08 13:12:48", ip: "192.168.1.100", status: "success", details: "Deleted test data record" },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === "all" || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return <LogIn className="h-4 w-4" />;
      case "create":
        return <FileText className="h-4 w-4" />;
      case "edit":
        return <Edit3 className="h-4 w-4" />;
      case "delete":
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "create":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "edit":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "delete":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "data_access":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "export":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "success" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === "success").length,
    failed: logs.filter(l => l.status === "failed").length,
  };

  const actions = ["all", "login", "create", "edit", "delete", "data_access", "export"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Track all system activities and user actions for compliance and security monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Logs (24h)</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Successful Actions</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.success}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Failed Actions</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{stats.failed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search by user, resource, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs"
          />
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action}
                size="sm"
                variant={filterAction === action ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => setFilterAction(action)}
              >
                <Filter className="h-3 w-3 mr-1" />
                {action === "data_access" ? "Access" : action === "all" ? "All" : action}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Activity Logs ({filteredLogs.length})</CardTitle>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Log ID</TableHead>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Resource</TableHead>
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">IP Address</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                    <TableCell className="text-xs font-mono">{log.id}</TableCell>
                    <TableCell className="text-xs">{log.user}</TableCell>
                    <TableCell>
                      <Badge className={`${getActionColor(log.action)} border text-xs flex items-center gap-1 w-fit`}>
                        {getActionIcon(log.action)}
                        {log.action.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.resource}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.timestamp}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{log.ip}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(log.status)} border text-xs`}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No logs match your search criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">⚠️ Security Alerts</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• Failed login attempt detected from IP 203.192.45.89 at 2026-04-08 13:45:22</p>
          <p>• All successful actions verified and logged correctly</p>
          <p>• User database accessed 2 times in last 24 hours</p>
          <p>• Automated compliance check: All audit logs retained past 30 days ✓</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
