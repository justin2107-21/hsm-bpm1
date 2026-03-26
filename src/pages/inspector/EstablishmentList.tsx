import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EstablishmentList = () => {
  const queryClient = useQueryClient();
  const [selectedEst, setSelectedEst] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");

  // Get current user
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch establishments
  const { data: establishments = [], isLoading } = useQuery({
    queryKey: ["establishments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("establishments")
        .select("*")
        .eq("status", "verified")
        .order("business_name", { ascending: true });
      return data || [];
    },
  });

  // Schedule inspection for establishment
  const scheduleInspectionMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !selectedEst || !inspectionDate) throw new Error("Missing fields");
      const { error } = await supabase.from("inspections").insert({
        establishment: selectedEst.business_name,
        inspection_date: inspectionDate,
        inspector_id: session.user.id,
        permit_id: null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection_schedule"] });
      toast.success("Inspection scheduled");
      setShowSchedule(false);
      setSelectedEst(null);
      setInspectionDate("");
    },
    onError: () => toast.error("Failed to schedule inspection"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Establishments Directory</h1>
        <p className="text-sm text-muted-foreground">Schedule inspections for verified businesses</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Store className="h-4 w-4" />
            Verified Establishments ({establishments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : establishments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No verified establishments.</div>
          ) : (
            <div className="space-y-3">
              {establishments.map((est: any) => (
                <div key={est.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{est.business_name}</p>
                      <p className="text-xs text-muted-foreground">{est.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Owner: {est.owner_name}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedEst(est);
                        setShowSchedule(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Modal */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Inspection - {selectedEst?.business_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Inspection Date</label>
              <Input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => scheduleInspectionMutation.mutate()}
                disabled={!inspectionDate || scheduleInspectionMutation.isPending}
              >
                Schedule Inspection
              </Button>
              <Button variant="outline" onClick={() => setShowSchedule(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstablishmentList;
