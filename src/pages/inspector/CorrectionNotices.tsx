import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const CorrectionNotices = () => {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Fetch all sanitation permits to track correction status
  const { data: permits = [], isLoading } = useQuery({
    queryKey: ["correction_notices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sanitation_permits")
        .select("*")
        .order("application_date", { ascending: false });
      return data || [];
    },
  });

  // Update permit status
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { permitId: string; status: string }) => {
      const { error } = await supabase
        .from("sanitation_permits")
        .update({ status: payload.status })
        .eq("id", payload.permitId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["correction_notices"] });
      toast.success("Status updated");
      setSelectedReport(null);
    },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Correction Notices</h1>
        <p className="text-sm text-muted-foreground">Issue and track correction notices for violations</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Permits Requiring Attention ({permits.filter(p => p.status !== "approved").length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : permits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No permits found.</div>
          ) : (
            <div className="space-y-3">
              {permits
                .filter(p => p.status !== "approved")
                .map((permit: any) => (
                  <div key={permit.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{permit.business_name}</p>
                        <p className="text-xs text-muted-foreground">{permit.owner_name}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        permit.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {permit.status}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedReport(permit)}
                    >
                      View & Update
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Modal */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Correction Notice - {selectedReport.business_name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Business Details</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Owner:</span> {selectedReport.owner_name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span> {selectedReport.business_type}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address:</span> {selectedReport.address}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Status:</span> {selectedReport.status}
                  </div>
                </div>
              </div>

              {selectedReport.notes && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Notes</h3>
                  <p className="text-sm">{selectedReport.notes}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      permitId: selectedReport.id,
                      status: "corrections_required",
                    })
                  }
                  variant="outline"
                >
                  Issue Correction Notice
                </Button>
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      permitId: selectedReport.id,
                      status: "approved",
                    })
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark Compliant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
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

export default CorrectionNotices;
