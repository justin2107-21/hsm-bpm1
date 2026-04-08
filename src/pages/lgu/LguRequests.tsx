import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const LguRequests = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: requests = [] } = useQuery({
    queryKey: ["lgu_requests_table"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const requestTypes = useMemo(() => {
    const types = [...new Set(requests.map((r: any) => r.request_type).filter(Boolean))];
    return types.sort();
  }, [requests]);

  const filtered = useMemo(() => {
    let result = requests;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (r: any) =>
          r.request_type.toLowerCase().includes(q) ||
          (r.title || "").toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((r: any) => r.status === statusFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((r: any) => r.request_type === typeFilter);
    }
    return result;
  }, [requests, search, statusFilter, typeFilter]);

  const stats = {
    total: requests.length,
    approved: requests.filter((r: any) => r.status === "approved").length,
    pending: requests.filter((r: any) => r.status === "pending").length,
    rejected: requests.filter((r: any) => r.status === "rejected").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Real-Time Service Requests</h1>
        <p className="text-sm text-muted-foreground">Municipal-wide monitoring (read-only)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{stats.rejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 px-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Types</option>
              {requestTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Service Requests ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No requests found.</p>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r: any) => (
                    <TableRow
                      key={r.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedRequest(r);
                        setDetailOpen(true);
                      }}
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{r.request_type}</TableCell>
                      <TableCell className="text-sm">{r.title}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(r.status)} border text-xs flex items-center gap-1 w-fit`}>
                          {getStatusIcon(r.status)}
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-6 text-xs">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Title</p>
                <p className="mt-1">{selectedRequest.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Type</p>
                <p className="mt-1">{selectedRequest.request_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Status</p>
                <Badge className={`${getStatusColor(selectedRequest.status)} border text-xs mt-1 flex items-center gap-1 w-fit`}>
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Description</p>
                <p className="mt-1 text-muted-foreground">{selectedRequest.description || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Created</p>
                <p className="mt-1">{new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LguRequests;

