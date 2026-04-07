import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const StaffPermitVerification = () => {
  const [search, setSearch] = useState("");
  const [selectedEstablishment, setSelectedEstablishment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: establishments = [] } = useQuery({
    queryKey: ["staff_establishments_verification"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return establishments;
    return establishments.filter(
      (e) =>
        (e.owner_name || "").toLowerCase().includes(q) ||
        (e.owner_email || "").toLowerCase().includes(q) ||
        e.business_name.toLowerCase().includes(q) ||
        (e.business_type || "").toLowerCase().includes(q) ||
        (e.barangay || "").toLowerCase().includes(q),
    );
  }, [establishments, search]);

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("establishments")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_establishments_verification"] });
      toast.success("Verification status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Sanitation Permit Document Verification</h1>
        <p className="text-sm text-muted-foreground">
          Verify establishment registration details and submitted permit documents before inspection scheduling
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by citizen name, email, business name, or barangay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No establishments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Citizen Name</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Business</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-xs">Permit Status</TableHead>
                  <TableHead className="text-xs w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedEstablishment(e); setIsDetailOpen(true); }}>
                    <TableCell className="text-sm font-medium">{e.owner_name || "—"}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{e.business_name}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{e.business_type || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={e.status} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {e.status === "registered" ? (
                        <span className="text-xs text-muted-foreground">No actions</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs"
                            onClick={() => verifyMutation.mutate({ id: e.id, status: "registered" })}
                            disabled={verifyMutation.isPending}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs"
                            onClick={() => verifyMutation.mutate({ id: e.id, status: "requires_correction" })}
                            disabled={verifyMutation.isPending}
                          >
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            Request Docs
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal for displaying full establishment/permit details */}
      {selectedEstablishment && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Permit Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {/* Reference ID */}
              <div>
                <p className="text-xs text-muted-foreground">Reference ID</p>
                <p className="font-medium">{selectedEstablishment.id}</p>
              </div>

              {/* Business Name */}
              <div>
                <p className="text-xs text-muted-foreground">Business Name</p>
                <p className="font-medium">{selectedEstablishment.business_name}</p>
              </div>

              {/* Business Type */}
              {selectedEstablishment.business_type && (
                <div>
                  <p className="text-xs text-muted-foreground">Business Type</p>
                  <p className="font-medium">{selectedEstablishment.business_type}</p>
                </div>
              )}

              {/* Permit Status */}
              <div>
                <p className="text-xs text-muted-foreground">Permit Status</p>
                <StatusBadge status={selectedEstablishment.status} />
              </div>

              {/* Owner Name */}
              {selectedEstablishment.owner_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{selectedEstablishment.owner_name}</p>
                </div>
              )}

              {/* Address */}
              {selectedEstablishment.address && (
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedEstablishment.address}</p>
                </div>
              )}

              {/* Barangay */}
              {selectedEstablishment.barangay && (
                <div>
                  <p className="text-xs text-muted-foreground">Barangay</p>
                  <p className="font-medium">{selectedEstablishment.barangay}</p>
                </div>
              )}

              {/* Contact Information */}
              {selectedEstablishment.contact_number && (
                <div>
                  <p className="text-xs text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{selectedEstablishment.contact_number}</p>
                </div>
              )}

              {/* Email */}
              {selectedEstablishment.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedEstablishment.email}</p>
                </div>
              )}

              {/* Date Submitted */}
              {selectedEstablishment.created_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Date Submitted</p>
                  <p className="font-medium">{new Date(selectedEstablishment.created_at).toLocaleString()}</p>
                </div>
              )}

              {/* Date Reviewed */}
              {selectedEstablishment.reviewed_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Date Reviewed</p>
                  <p className="font-medium">{new Date(selectedEstablishment.reviewed_at).toLocaleString()}</p>
                </div>
              )}

              {/* Additional fields from database */}
              {Object.entries(selectedEstablishment)
                .filter(
                  ([key]) =>
                    ![
                      "id",
                      "business_name",
                      "business_type",
                      "status",
                      "owner_name",
                      "address",
                      "barangay",
                      "contact_number",
                      "email",
                      "created_at",
                      "reviewed_at",
                    ].includes(key),
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground">{key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                    <p className="font-medium">{value ? String(value) : "N/A"}</p>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StaffPermitVerification;

