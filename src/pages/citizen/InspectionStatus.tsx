import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";

const InspectionStatus = () => {
  const { user } = useAuth();

  const { data: establishments = [] } = useQuery({
    queryKey: ["citizen_establishments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("establishments").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ["citizen_inspections", user?.id, establishments],
    queryFn: async () => {
      if (establishments.length === 0) return [];
      const establishmentNames = establishments.map((e: any) => e.business_name);
      const { data, error } = await supabase
        .from("inspections")
        .select("*")
        .in("establishment", establishmentNames)
        .order("inspection_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && establishments.length > 0,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Inspection Status</h1>
        <p className="text-sm text-muted-foreground">Track inspection schedules, results, and corrections</p>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm font-heading">Inspection Records</CardTitle></CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No inspection records found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Establishment</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Findings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="text-sm">{i.inspection_date}</TableCell>
                    <TableCell className="text-sm">{i.establishment}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{i.findings || "—"}</TableCell>
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

export default InspectionStatus;
