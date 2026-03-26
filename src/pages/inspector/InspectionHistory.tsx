import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { useState } from "react";

const InspectionHistory = () => {
  const [selectedInspection, setSelectedInspection] = useState<any>(null);

  // Fetch completed inspections
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["inspection_history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inspections")
        .select("*")
        .not("findings", "is", null)
        .order("inspection_date", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Inspection History</h1>
        <p className="text-sm text-muted-foreground">Review past inspections and their outcomes</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <History className="h-4 w-4" />
            Past Inspections ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No inspection history.</div>
          ) : (
            <div className="space-y-3">
              {history.map((inspection: any) => (
                <div key={inspection.id} className="p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition">
                  <div className="flex items-start justify-between mb-2">
                    <div onClick={() => setSelectedInspection(inspection)} className="flex-1">
                      <p className="font-medium">{inspection.establishment}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inspection.inspection_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs mt-2 text-muted-foreground line-clamp-2">
                        {inspection.findings}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInspection(inspection)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Detail Modal */}
      {selectedInspection && (
        <Dialog open={!!selectedInspection} onOpenChange={() => setSelectedInspection(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inspection Record - {selectedInspection.establishment}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Inspection Details</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {new Date(selectedInspection.inspection_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inspector ID:</span> {selectedInspection.inspector_id || "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recorded:</span>{" "}
                    {new Date(selectedInspection.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {selectedInspection.findings && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Findings</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedInspection.findings}</p>
                </div>
              )}

              {selectedInspection.checklist && Object.keys(selectedInspection.checklist).length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Inspection Checklist</h3>
                  <ul className="space-y-1">
                    {Object.entries(selectedInspection.checklist).map(([key, val]: [string, any]) => (
                      <li key={key} className="text-sm">
                        {val === true ? "✓" : "✗"} {key}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setSelectedInspection(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InspectionHistory;
