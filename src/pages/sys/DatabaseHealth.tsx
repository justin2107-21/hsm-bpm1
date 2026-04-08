import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, HardDrive, CheckCircle2, AlertCircle, Download } from "lucide-react";

const DatabaseHealth = () => {
  const backups = [
    { id: "BKP-001", timestamp: "2026-04-08 23:00", size: "245 MB", status: "completed", duration: "2m 34s" },
    { id: "BKP-002", timestamp: "2026-04-08 18:00", size: "243 MB", status: "completed", duration: "2m 28s" },
    { id: "BKP-003", timestamp: "2026-04-08 13:00", size: "242 MB", status: "completed", duration: "2m 31s" },
    { id: "BKP-004", timestamp: "2026-04-08 08:00", size: "241 MB", status: "completed", duration: "2m 29s" },
    { id: "BKP-005", timestamp: "2026-04-07 23:00", size: "240 MB", status: "completed", duration: "2m 32s" },
  ];

  const tables = [
    { name: "profiles", rows: "1,245", size: "12.5 MB", indexes: 4 },
    { name: "resident_health_records", rows: "8,932", size: "28.4 MB", indexes: 3 },
    { name: "service_requests", rows: "3,456", size: "8.9 MB", indexes: 2 },
    { name: "vaccinations", rows: "12,567", size: "35.2 MB", indexes: 2 },
    { name: "activities", rows: "45,892", size: "52.1 MB", indexes: 1 },
    { name: "audit_logs", rows: "89,234", size: "95.6 MB", indexes: 2 },
  ];

  const getStatusColor = (status: string) => {
    if (status === "completed") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (status === "in-progress") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (status === "failed") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const totalSize = 12.5 + 28.4 + 8.9 + 35.2 + 52.1 + 95.6;
  const usedPercentage = (totalSize / 500) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Database Health & Backups</h1>
        <p className="text-sm text-muted-foreground">Monitor database performance, storage, and backup status</p>
      </div>

      {/* Database Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Database Status</p>
                <p className="text-lg font-bold text-green-400 mt-1">Healthy</p>
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Storage Used</p>
                <p className="text-lg font-bold text-blue-400 mt-1">{totalSize.toFixed(1)} GB</p>
                <p className="text-xs text-muted-foreground mt-1">of 500 GB allocated</p>
              </div>
              <HardDrive className="h-10 w-10 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Last Backup</p>
                <p className="text-lg font-bold text-purple-400 mt-1">2 hours ago</p>
                <p className="text-xs text-muted-foreground mt-1">Scheduled hourly</p>
              </div>
              <Database className="h-10 w-10 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm">Storage Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${usedPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalSize.toFixed(1)} GB used</span>
            <span>{(500 - totalSize).toFixed(1)} GB available</span>
          </div>
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Consider archiving old logs when storage exceeds 80%
          </p>
        </CardContent>
      </Card>

      {/* Database Tables */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Table Name</TableHead>
                  <TableHead className="text-xs">Row Count</TableHead>
                  <TableHead className="text-xs">Size</TableHead>
                  <TableHead className="text-xs">Indexes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-xs font-mono">{table.name}</TableCell>
                    <TableCell className="text-xs">{table.rows}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{table.size}</TableCell>
                    <TableCell className="text-xs">{table.indexes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Backup ID</TableHead>
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Size</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-xs font-mono">{backup.id}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{backup.timestamp}</TableCell>
                    <TableCell className="text-xs">{backup.size}</TableCell>
                    <TableCell className="text-xs">{backup.duration}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(backup.status)} border text-xs`}>
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        <Download className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Database Statistics */}
      <Card className="glass-card border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">✓ Database Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• Total Tables: 6 | Total Rows: 161,226 | Total Size: {totalSize.toFixed(1)} GB</p>
          <p>• Connection Pool: 10 active | Avg Query Time: 12ms</p>
          <p>• Last Integrity Check: 2026-04-08 12:00 UTC - All OK</p>
          <p>• Replication Status: In Sync | Backup Retention: 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseHealth;
