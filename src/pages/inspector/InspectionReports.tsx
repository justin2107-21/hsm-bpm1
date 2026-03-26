import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";

const InspectionReports = () => {
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Fetch all inspection reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["inspection_reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inspections")
        .select("*")
        .not("findings", "is", null)
        .order("inspection_date", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Inspection Reports</h1>
        <p className="text-sm text-muted-foreground">View completed inspection records</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Completed Inspections ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No completed inspection reports.</div>
          ) : (
            <div className="space-y-3">
              {reports.map((report: any) => (
                <div key={report.id} className="p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition">
                  <div className="flex items-start justify-between">
                    <div onClick={() => setSelectedReport(report)} className="flex-1">
                      <p className="font-medium">{report.establishment}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.inspection_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs mt-2 text-muted-foreground line-clamp-2">
                        {report.findings}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReport(report)}
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

      {/* Report Detail Modal */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inspection Report - {selectedReport.establishment}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Report Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {new Date(selectedReport.inspection_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inspector:</span> 
                    {selectedReport.inspector_id ? " Recorded" : " Pending"}
                  </div>
                </div>
              </div>

              {selectedReport.findings && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Findings</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedReport.findings}</p>
                </div>
              )}

              {selectedReport.checklist && Object.keys(selectedReport.checklist).length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Checklist</h3>
                  <ul className="space-y-1">
                    {Object.entries(selectedReport.checklist).map(([key, val]: [string, any]) => (
                      <li key={key} className="text-sm">
                        {val ? "✓" : "✗"} {key}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InspectionReports;
