import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { HeartPulse } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

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
                  <TableRow key={n.id}>
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
    </div>
  );
};

export default BhwNutritionMonitoring;

