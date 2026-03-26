import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Search } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

const LguSanitation = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedPermit, setSelectedPermit] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: permits = [] } = useQuery({
    queryKey: ["lgu_san_permits"],
    queryFn: async () => {
      const { data } = await supabase.from("sanitation_permits").select("*").order("application_date", { ascending: false });
      return data || [];
    },
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ["inspections"],
    queryFn: async () => {
      const { data } = await supabase.from("inspections").select("*");
      return data || [];
    },
  });

  // Update permit status
  const updatePermitMutation = useMutation({
    mutationFn: async (payload: { permitId: string; status: string }) => {
      const { error } = await supabase
        .from("sanitation_permits")
        .update({ status: payload.status })
        .eq("id", payload.permitId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lgu_san_permits"] });
      toast.success("Permit status updated");
      setSelectedPermit(null);
    },
    onError: () => toast.error("Failed to update permit"),
  });

  // Get inspection findings for a permit
  const getInspectionFindings = (permitId: string) => {
    const inspection = inspections.find(i => i.permit_id === permitId);
    return inspection;
  };

  const filteredPermits = permits.filter(p => {
    const matchesSearch =
      (p.business_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.owner_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Sanitation & Permit Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and approve sanitation permits</p>
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" /> Permit Applications ({filteredPermits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPermits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No permits found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Business</TableHead>
                    <TableHead className="text-xs">Owner</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermits.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPermit(p)}
                    >
                      <TableCell className="text-sm font-medium">{p.business_name}</TableCell>
                      <TableCell className="text-sm">{p.owner_name}</TableCell>
                      <TableCell className="text-sm">{p.business_type || "—"}</TableCell>
                      <TableCell className="text-sm">{p.application_date}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPermit(p);
                          }}
                        >
                          Review
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

      {/* Permit Review Modal */}
      {selectedPermit && (
        <Dialog open={!!selectedPermit} onOpenChange={() => setSelectedPermit(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Permit Application Review</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Business Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Business Name:</span> {selectedPermit.business_name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Owner:</span> {selectedPermit.owner_name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span> {selectedPermit.business_type || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address:</span> {selectedPermit.address || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedPermit.status} />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied Date:</span> {selectedPermit.application_date}
                  </div>
                </div>
              </div>

              {getInspectionFindings(selectedPermit.id) && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Inspection Findings</h3>
                  <p className="text-sm">{getInspectionFindings(selectedPermit.id).findings || "No findings recorded"}</p>
                </div>
              )}

              {selectedPermit.notes && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Notes</h3>
                  <p className="text-sm">{selectedPermit.notes}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() =>
                    updatePermitMutation.mutate({
                      permitId: selectedPermit.id,
                      status: "approved",
                    })
                  }
                  className="bg-green-600 hover:bg-green-700"
                  disabled={selectedPermit.status === "approved" || updatePermitMutation.isPending}
                >
                  Approve Permit
                </Button>
                <Button
                  onClick={() =>
                    updatePermitMutation.mutate({
                      permitId: selectedPermit.id,
                      status: "rejected",
                    })
                  }
                  variant="destructive"
                  disabled={selectedPermit.status === "rejected" || updatePermitMutation.isPending}
                >
                  Reject Permit
                </Button>
                <Button
                  onClick={() =>
                    updatePermitMutation.mutate({
                      permitId: selectedPermit.id,
                      status: "pending",
                    })
                  }
                  variant="outline"
                  disabled={updatePermitMutation.isPending}
                >
                  Request Re-inspection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPermit(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LguSanitation;
