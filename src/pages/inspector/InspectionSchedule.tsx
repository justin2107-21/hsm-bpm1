import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

const InspectionSchedule = () => {
  const queryClient = useQueryClient();
  const [creatingNew, setCreatingNew] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newEstablishment, setNewEstablishment] = useState("");

  // Get current user
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch scheduled inspections
  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["inspection_schedule"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inspections")
        .select("*")
        .gte("inspection_date", new Date().toISOString().split("T")[0])
        .order("inspection_date", { ascending: true });
      return data || [];
    },
  });

  // Create new scheduled inspection
  const createScheduleMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !newDate || !newEstablishment) throw new Error("Missing fields");
      const { error } = await supabase.from("inspections").insert({
        establishment: newEstablishment,
        inspection_date: newDate,
        inspector_id: session.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection_schedule"] });
      toast.success("Inspection scheduled");
      setCreatingNew(false);
      setNewDate("");
      setNewEstablishment("");
    },
    onError: () => toast.error("Failed to schedule inspection"),
  });

  // Group by date
  const grouped = inspections.reduce(
    (acc, insp) => {
      const date = new Date(insp.inspection_date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(insp);
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Inspection Schedule</h1>
          <p className="text-sm text-muted-foreground">Upcoming inspections by date</p>
        </div>
        <Button onClick={() => setCreatingNew(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Schedule New
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduled ({inspections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No scheduled inspections.</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <p className="font-semibold text-sm mb-2">{date}</p>
                  <div className="space-y-2 ml-4">
                    {items.map((insp: any) => (
                      <div key={insp.id} className="p-3 bg-muted/30 rounded-lg text-sm">
                        <p className="font-medium">{insp.establishment}</p>
                        <p className="text-xs text-muted-foreground">
                          Inspector: {insp.inspector_id ? "Assigned" : "Unassigned"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={creatingNew} onOpenChange={setCreatingNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Inspection</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Establishment Name</label>
              <Input
                placeholder="e.g., McDonald's Branch 1"
                value={newEstablishment}
                onChange={(e) => setNewEstablishment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Inspection Date</label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => createScheduleMutation.mutate()}
                disabled={!newDate || !newEstablishment || createScheduleMutation.isPending}
              >
                Schedule
              </Button>
              <Button variant="outline" onClick={() => setCreatingNew(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InspectionSchedule;
