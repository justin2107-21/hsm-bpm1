import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store, Plus, MapPin, User, Phone, Mail } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const EstablishmentList = () => {
  const queryClient = useQueryClient();
  const [selectedEst, setSelectedEst] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");
  const [search, setSearch] = useState("");

  // Get current user
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch ALL establishments - no filter
  const { data: establishments = [], isLoading, error } = useQuery({
    queryKey: ["establishments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .order("business_name", { ascending: true });
      
      if (error) {
        console.error("Error fetching establishments:", error);
        throw error;
      }
      console.log("Fetched establishments:", data);
      return data || [];
    },
  });

  // Filter establishments by search
  const filtered = useMemo(() => {
    if (!search.trim()) return establishments;
    const q = search.toLowerCase();
    return establishments.filter((est: any) =>
      est.business_name?.toLowerCase().includes(q) ||
      est.owner_name?.toLowerCase().includes(q) ||
      est.address?.toLowerCase().includes(q) ||
      est.business_type?.toLowerCase().includes(q)
    );
  }, [establishments, search]);

  // Schedule inspection
  const scheduleInspectionMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !selectedEst || !inspectionDate) {
        throw new Error("Missing required fields");
      }
      const { error } = await supabase.from("inspections").insert({
        establishment_id: selectedEst.id,
        scheduled_date: inspectionDate,
        inspector_id: session.user.id,
        status: "scheduled",
        notes: `Inspection scheduled for ${selectedEst.business_name}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["establishments"] });
      toast.success("Inspection scheduled successfully!");
      setShowSchedule(false);
      setSelectedEst(null);
      setInspectionDate("");
    },
    onError: (err: any) => {
      console.error("Schedule error:", err);
      toast.error("Failed to schedule inspection");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Establishments Directory</h1>
        <p className="text-sm text-muted-foreground">
          {establishments.length} verified businesses available for inspection
        </p>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <Input
            placeholder="Search by name, owner, type, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </CardContent>
      </Card>

      {/* Establishments List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Store className="h-4 w-4" />
            Establishments ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading establishments...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">Error loading data. Check console.</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "No establishments match your search." : "No establishments found."}
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((est: any) => (
                <div
                  key={est.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEst(est);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {est.business_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {est.business_type || "General"}
                        </Badge>
                        {est.compliance_rating && (
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400">
                            {est.compliance_rating}% Compliance
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {est.owner_name || "Unknown"}
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{est.address || "No address"}</span>
                        </div>
                        {est.contact_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {est.contact_number}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEst(est);
                          setShowDetails(true);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEst(est);
                          setShowSchedule(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEst?.business_name}</DialogTitle>
          </DialogHeader>
          {selectedEst && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Business Type</p>
                  <Badge className="mt-1">{selectedEst.business_type || "General"}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Owner</p>
                  <p className="font-medium text-sm">{selectedEst.owner_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Address</p>
                  <p className="text-sm">{selectedEst.address}</p>
                </div>
                {selectedEst.contact_number && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Contact</p>
                    <p className="text-sm">{selectedEst.contact_number}</p>
                  </div>
                )}
                {selectedEst.email && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Email</p>
                    <p className="text-sm">{selectedEst.email}</p>
                  </div>
                )}
                {selectedEst.compliance_rating && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Compliance Rating</p>
                    <p className="text-lg font-bold text-green-400">{selectedEst.compliance_rating}%</p>
                  </div>
                )}
                {selectedEst.permit_number && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Permit #</p>
                    <p className="text-sm">{selectedEst.permit_number}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowDetails(false);
                    setShowSchedule(true);
                  }}
                >
                  Schedule Inspection
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Inspection Modal */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Inspection</DialogTitle>
          </DialogHeader>
          {selectedEst && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Inspection for:</p>
                <p className="font-semibold text-sm">{selectedEst.business_name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Select Date</label>
                <Input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="h-9"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => scheduleInspectionMutation.mutate()}
                  disabled={!inspectionDate || scheduleInspectionMutation.isPending}
                >
                  {scheduleInspectionMutation.isPending ? "Scheduling..." : "Confirm Schedule"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSchedule(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstablishmentList;
