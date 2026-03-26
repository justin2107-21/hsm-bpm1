import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Play } from "lucide-react";
import { toast } from "sonner";

const AssignedInspections = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ checklist: {} as Record<string, boolean>, findings: "" });

  // Get current user
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch inspections assigned to inspector
  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["assigned_inspections", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data } = await supabase
        .from("inspections")
        .select("*")
        .eq("inspector_id", session.user.id)
        .order("inspection_date", { ascending: true });
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  // Update inspection
  const updateInspectionMutation = useMutation({
    mutationFn: async (inspectionId: string) => {
      const { error } = await supabase
        .from("inspections")
        .update({
          checklist: formData.checklist,
          findings: formData.findings,
        })
        .eq("id", inspectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assigned_inspections"] });
      toast.success("Inspection updated");
      setEditingId(null);
      setFormData({ checklist: {}, findings: "" });
    },
    onError: () => toast.error("Failed to update inspection"),
  });

  const openEdit = (inspection: any) => {
    setEditingId(inspection.id);
    setFormData({
      checklist: inspection.checklist || {},
      findings: inspection.findings || "",
    });
  };

  const checklistItems = ["Sanitation", "Storage", "Preparation", "Staff Hygiene", "Equipment"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Your Assigned Inspections</h1>
        <p className="text-sm text-muted-foreground">Conduct inspections and record findings</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Inspections To Complete ({inspections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No inspections assigned to you.</div>
          ) : (
            <div className="space-y-3">
              {inspections.map((inspection: any) => (
                <div key={inspection.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{inspection.establishment}</p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled: {new Date(inspection.inspection_date).toLocaleDateString()}
                      </p>
                      {inspection.findings && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          ✓ Findings recorded
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => openEdit(inspection)}
                      size="sm"
                      variant={inspection.findings ? "outline" : "default"}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {inspection.findings ? "Edit" : "Start"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Inspection</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <label className="font-semibold text-sm">Inspection Checklist</label>
              {checklistItems.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.checklist[item] === true}
                    onCheckedChange={(val: any) =>
                      setFormData({
                        ...formData,
                        checklist: { ...formData.checklist, [item]: Boolean(val) },
                      })
                    }
                  />
                  <label className="text-sm">{item}</label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-sm">Detailed Findings</label>
              <Textarea
                placeholder="Document violations, observations, and recommendations..."
                value={formData.findings}
                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => updateInspectionMutation.mutate(editingId!)}
                disabled={!formData.findings || updateInspectionMutation.isPending}
              >
                Save Findings
              </Button>
              <Button variant="outline" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignedInspections;
