import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { HeartPulse } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BhwNutritionMonitoring = () => {
  const { data: nutrition = [] } = useQuery({
    queryKey: ["bhw_nutrition"],
    queryFn: async () => {
      const { data } = await supabase
        .from("nutrition_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Nutrition Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Track malnutrition and growth monitoring records for children in your barangay.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" /> Recent Nutrition Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nutrition.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No nutrition records.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Child</TableHead>
                  <TableHead className="text-xs">Age</TableHead>
                  <TableHead className="text-xs">Weight</TableHead>
                  <TableHead className="text-xs">Height</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nutrition.map((n: any) => (
                  <TableRow key={n.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedRecord(n); setIsModalOpen(true); }}>
                    <TableCell className="text-sm">{n.child_name}</TableCell>
                    <TableCell className="text-sm">{n.age || "—"}</TableCell>
                    <TableCell className="text-sm">{n.weight || "—"}</TableCell>
                    <TableCell className="text-sm">{n.height || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={n.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedRecord && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Nutrition Record Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Reference ID</p>
                <p className="font-medium">{selectedRecord.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Child Name</p>
                <p className="font-medium">{selectedRecord.child_name}</p>
              </div>
              {selectedRecord.age && (
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{selectedRecord.age}</p>
                </div>
              )}
              {selectedRecord.weight && (
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-medium">{selectedRecord.weight}</p>
                </div>
              )}
              {selectedRecord.height && (
                <div>
                  <p className="text-xs text-muted-foreground">Height</p>
                  <p className="font-medium">{selectedRecord.height}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={selectedRecord.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="font-medium">{new Date(selectedRecord.created_at).toLocaleString()}</p>
              </div>
              {selectedRecord.updated_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Updated At</p>
                  <p className="font-medium">{new Date(selectedRecord.updated_at).toLocaleString()}</p>
                </div>
              )}
              {/* Add any other fields dynamically if needed */}
              {Object.entries(selectedRecord).filter(([key]) => !['id', 'child_name', 'age', 'weight', 'height', 'status', 'created_at', 'updated_at'].includes(key)).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p className="font-medium">{value ? String(value) : 'N/A'}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default BhwNutritionMonitoring;

