import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ComplianceMonitoring = () => {
  const queryClient = useQueryClient();
  const [selectedPermit, setSelectedPermit] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  // Fetch permits
  const { data: permits = [], isLoading } = useQuery({
    queryKey: ["compliance_monitoring"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sanitation_permits")
        .select("*")
        .order("application_date", { ascending: false });
      return data || [];
    },
  });

  // Update compliance status
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { permitId: string; status: string }) => {
      const { error } = await supabase
        .from("sanitation_permits")
        .update({ status: payload.status })
        .eq("id", payload.permitId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance_monitoring"] });
      toast.success("Compliance status updated");
      setSelectedPermit(null);
    },
    onError: () => toast.error("Failed to update"),
  });

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-800";
    if (status === "corrections_required") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const filteredPermits = permits.filter((p: any) => {
    if (filter === "compliant") return p.status === "approved";
    if (filter === "non_compliant") return p.status === "corrections_required";
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Compliance Monitoring</h1>
        <p className="text-sm text-muted-foreground">Track compliance status of all establishments</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({permits.length})
        </Button>
        <Button
          size="sm"
          variant={filter === "compliant" ? "default" : "outline"}
          onClick={() => setFilter("compliant")}
        >
          Compliant ({permits.filter(p => p.status === "approved").length})
        </Button>
        <Button
          size="sm"
          variant={filter === "non_compliant" ? "default" : "outline"}
          onClick={() => setFilter("non_compliant")}
        >
          Non-Compliant ({permits.filter(p => p.status === "corrections_required").length})
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Monitored Establishments ({filteredPermits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : filteredPermits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No establishments match filter.</div>
          ) : (
            <div className="space-y-3">
              {filteredPermits.map((permit: any) => (
                <div key={permit.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{permit.business_name}</p>
                      <p className="text-xs text-muted-foreground">{permit.business_type}</p>
                      <p className="text-xs text-muted-foreground mt-1">{permit.address}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(permit.status)}`}>
                      {permit.status === "approved"
                        ? "Compliant"
                        : permit.status === "corrections_required"
                        ? "Non-Compliant"
                        : "Pending"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPermit(permit)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedPermit && (
        <Dialog open={!!selectedPermit} onOpenChange={() => setSelectedPermit(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedPermit.business_name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Establishment Information</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Owner:</span> {selectedPermit.owner_name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span> {selectedPermit.business_type}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address:</span> {selectedPermit.address}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Apply Date:</span>{" "}
                    {new Date(selectedPermit.application_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Compliance Status:</span>{" "}
                    <span className={`text-xs px-2 py-1 rounded ml-2 ${getStatusColor(selectedPermit.status)}`}>
                      {selectedPermit.status === "approved"
                        ? "Compliant"
                        : selectedPermit.status === "corrections_required"
                        ? "Non-Compliant"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedPermit.inspector && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Assigned Inspector</h3>
                  <p className="text-sm">{selectedPermit.inspector}</p>
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
                    updateStatusMutation.mutate({
                      permitId: selectedPermit.id,
                      status: "approved",
                    })
                  }
                  className="bg-green-600 hover:bg-green-700"
                  disabled={selectedPermit.status === "approved"}
                >
                  Mark Compliant
                </Button>
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      permitId: selectedPermit.id,
                      status: "corrections_required",
                    })
                  }
                  variant="outline"
                  disabled={selectedPermit.status === "corrections_required"}
                >
                  Mark Non-Compliant
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

export default ComplianceMonitoring;
