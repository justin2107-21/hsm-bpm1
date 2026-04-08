import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Calendar, User, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function LguInspections() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch inspections from sanitary_inspections table
  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["inspections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inspections")
        .select(
          "id, application_id, scheduled_date, status, inspector_id, created_at, notes"
        )
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch inspector names (join with profiles)
  const { data: inspectorMap = {} } = useQuery({
    queryKey: ["inspectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name");

      if (error) throw error;

      const map: Record<string, string> = {};
      (data || []).forEach((p) => {
        map[p.id] = p.full_name || "Unknown";
      });
      return map;
    },
  });

  // Extract unique statuses for filter
  const statuses = useMemo(() => {
    const set = new Set(inspections.map((i: any) => i.status));
    return Array.from(set).filter(Boolean);
  }, [inspections]);

  // Filter logic
  const filtered = useMemo(() => {
    return inspections.filter((inspection: any) => {
      const matchesSearch =
        (inspection.application_id ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (inspectorMap[inspection.inspector_id] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || inspection.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inspections, search, statusFilter, inspectorMap]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Loading inspections...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Inspections</h1>
          <p className="text-muted-foreground mt-1">
            Monitor scheduled and ongoing sanitary inspections
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Inspections</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{inspections.length}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  {
                    inspections.filter(
                      (i: any) => i.status === "scheduled" || i.status === "pending"
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-6 w-6 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {inspections.filter((i: any) => i.status === "completed").length}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Issues</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  {inspections.filter((i: any) => i.status === "failed" || i.status === "appeal").length}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by application ID or inspector..."
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
              {statuses.map((s: any) => (
                <option key={s} value={s}>
                  {(s as string).charAt(0).toUpperCase() + (s as string).slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inspections Table */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">
            Inspections ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No inspections found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Application</TableHead>
                    <TableHead className="text-xs">Inspector</TableHead>
                    <TableHead className="text-xs">Scheduled Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inspection: any) => (
                    <TableRow
                      key={inspection.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedInspection(inspection);
                        setDetailOpen(true);
                      }}
                    >
                      <TableCell className="text-sm font-medium">
                        {inspection.application_id}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inspectorMap[inspection.inspector_id] || "Unassigned"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inspection.scheduled_date
                          ? new Date(inspection.scheduled_date).toLocaleDateString()
                          : "Not scheduled"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inspection.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInspection(inspection);
                            setDetailOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inspection Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-sm">Inspection Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Application ID
                    </span>
                    <div className="font-medium mt-1">{selectedInspection.application_id}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> Inspector
                    </span>
                    <div className="font-medium mt-1">
                      {inspectorMap[selectedInspection.inspector_id] || "Unassigned"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scheduled Date</span>
                    <div className="font-medium">
                      {selectedInspection.scheduled_date
                        ? new Date(selectedInspection.scheduled_date).toLocaleString()
                        : "Not scheduled"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <div className="mt-1">
                      <StatusBadge status={selectedInspection.status} />
                    </div>
                  </div>
                </div>
              </div>

              {selectedInspection.notes && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Notes</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedInspection.notes}</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDetailOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
