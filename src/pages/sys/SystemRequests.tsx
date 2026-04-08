import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const SystemRequests = () => {
  const requests = [
    { id: "REQ-001", type: "Health Assessment", status: "completed", user: "Maria Santos", date: "2026-04-08 14:32", module: "Health Center" },
    { id: "REQ-002", type: "Vaccination Record", status: "pending", user: "Juan dela Cruz", date: "2026-04-08 13:45", module: "Immunization" },
    { id: "REQ-003", type: "Service Request", status: "in-progress", user: "Anna Garcia", date: "2026-04-08 12:15", module: "Health Services" },
    { id: "REQ-004", type: "Sanitation Permit", status: "completed", user: "Carlos Reyes", date: "2026-04-08 11:00", module: "Sanitation" },
    { id: "REQ-005", type: "Disease Report", status: "pending", user: "Rosa Mendoza", date: "2026-04-08 10:30", module: "Surveillance" },
    { id: "REQ-006", type: "Complaint", status: "in-progress", user: "John Smith", date: "2026-04-08 09:15", module: "Complaints" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in-progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const stats = {
    total: requests.length,
    completed: requests.filter(r => r.status === "completed").length,
    inProgress: requests.filter(r => r.status === "in-progress").length,
    pending: requests.filter(r => r.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Active Requests & Module Performance</h1>
        <p className="text-sm text-muted-foreground">Track and manage active system requests across all modules</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.total}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
              </div>
              <Clock className="h-10 w-10 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Request Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Request ID</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Module</TableHead>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date/Time</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-xs font-mono">{req.id}</TableCell>
                    <TableCell className="text-xs">{req.type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.module}</TableCell>
                    <TableCell className="text-xs">{req.user}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(req.status)} border text-xs flex items-center gap-1 w-fit`}>
                        {getStatusIcon(req.status)}
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.date}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["Health Center", "Immunization", "Health Services", "Sanitation", "Surveillance"].map((module, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded border border-border/50">
                <span className="text-sm text-muted-foreground">{module}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${85 + Math.random() * 15}%` }}></div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{Math.round(85 + Math.random() * 15)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemRequests;
