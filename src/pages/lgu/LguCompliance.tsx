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
import { Search, Building2, Calendar } from "lucide-react";

const LguCompliance = () => {
  const [search, setSearch] = useState("");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Fetch inspection reports (compliance data)
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["inspection_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inspections")
        .select(
          "id, establishment, findings, inspection_date, inspector_id, permit_id, checklist, created_at"
        )
        .order("inspection_date", { ascending: false });
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

  // Filter reports
  const filtered = useMemo(() => {
    return reports.filter((report: any) => {
      const matchesSearch =
        (report.establishment ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [reports, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Loading compliance records...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Establishment Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Monitor establishment compliance status and inspection findings
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Inspections</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {reports.filter((r: any) => r.findings && r.findings.includes("complied")).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">With Findings</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search establishment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Table */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">
            Inspections ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No inspection records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Establishment</TableHead>
                    <TableHead className="text-xs">Inspection Date</TableHead>
                    <TableHead className="text-xs">Inspector</TableHead>
                    <TableHead className="text-xs">Has Findings</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((report: any) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedReport(report);
                        setDetailOpen(true);
                      }}
                    >
                      <TableCell className="text-sm font-medium">
                        {report.establishment}
                      </TableCell>
                      <TableCell className="text-sm">
                        {report.inspection_date
                          ? new Date(report.inspection_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inspectorMap[report.inspector_id] || "Unassigned"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {report.findings ? "✓" : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
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

      {/* Compliance Detail Modal */}
      {selectedReport && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedReport.establishment} - Inspection Report</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-sm">Inspection Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Establishment
                    </span>
                    <div className="font-medium mt-1">{selectedReport.establishment}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Inspection Date
                    </span>
                    <div className="font-medium mt-1">
                      {selectedReport.inspection_date
                        ? new Date(selectedReport.inspection_date).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Inspector</span>
                    <div className="font-medium mt-1">
                      {inspectorMap[selectedReport.inspector_id] || "Unassigned"}
                    </div>
                  </div>
                </div>
              </div>

              {selectedReport.checklist && Object.keys(selectedReport.checklist).length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Inspection Checklist</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedReport.checklist).map(([key, value]: any) => (
                      <div key={key} className="text-sm flex justify-between">
                        <span>{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.findings && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Findings</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedReport.findings}</p>
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
};

export default LguCompliance;
