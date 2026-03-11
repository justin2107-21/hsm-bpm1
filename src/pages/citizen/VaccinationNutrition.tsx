import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Syringe } from "lucide-react";

const VaccinationNutrition = () => {
  const { user } = useAuth();

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["citizen_vaccinations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vaccinations").select("*").order("vaccination_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const scheduled = vaccinations.filter(v => v.status === "scheduled");
  const completed = vaccinations.filter(v => v.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Vaccination & Nutrition</h1>
        <p className="text-sm text-muted-foreground">Track vaccination records and nutrition monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <Syringe className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{vaccinations.length}</p>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-success">{completed.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-warning">{scheduled.length}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm font-heading">Vaccination Records</CardTitle></CardHeader>
        <CardContent>
          {vaccinations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No vaccination records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Vaccine</TableHead>
                  <TableHead className="text-xs">Child</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">BHW</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaccinations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-sm">{v.vaccination_date}</TableCell>
                    <TableCell className="text-sm">{v.vaccine}</TableCell>
                    <TableCell className="text-sm">{v.child_name}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{v.bhw_name}</TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
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

export default VaccinationNutrition;
