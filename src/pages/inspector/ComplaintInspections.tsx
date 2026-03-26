import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

const ComplaintInspections = () => {
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Fetch complaints
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaint_inspections"],
    queryFn: async () => {
      const { data } = await supabase
        .from("resident_complaints")
        .select("*")
        .neq("status", "resolved")
        .order("complaint_date", { ascending: false });
      return data || [];
    },
  });

  // Update complaint status
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { complaintId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("resident_complaints")
        .update({ status: payload.newStatus })
        .eq("id", payload.complaintId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint_inspections"] });
      toast.success("Status updated");
      setSelectedComplaint(null);
      setResolutionNotes("");
    },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Complaint Investigations</h1>
        <p className="text-sm text-muted-foreground">Respond to and resolve complaints</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Active Complaints ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No active complaints.</div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint: any) => (
                <div key={complaint.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{complaint.complaint_type}</p>
                      <p className="text-xs text-muted-foreground">{complaint.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">{complaint.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      complaint.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setResolutionNotes("");
                    }}
                  >
                    Investigate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investigation Modal */}
      {selectedComplaint && (
        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Investigate Complaint</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Complaint Details</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span> {selectedComplaint.complaint_type}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span> {selectedComplaint.location}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Description:</span> {selectedComplaint.description}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {new Date(selectedComplaint.complaint_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Investigation Notes</label>
                <Textarea
                  placeholder="Document findings, actions taken, and resolution..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      complaintId: selectedComplaint.id,
                      newStatus: "in_progress",
                    })
                  }
                  variant="outline"
                >
                  Mark In Progress
                </Button>
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      complaintId: selectedComplaint.id,
                      newStatus: "resolved",
                    })
                  }
                  disabled={!resolutionNotes}
                >
                  Mark Resolved
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ComplaintInspections;
