import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { HeartPulse, Plus } from "lucide-react";

const HealthServices = () => {
  const { user } = useAuth();

  const { data: records = [] } = useQuery({
    queryKey: ["citizen_health_records", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resident_health_records").select("*").order("record_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Health Services</h1>
          <p className="text-sm text-muted-foreground">View your health records and request consultations</p>
        </div>
        <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Request Consultation</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card cursor-pointer hover:border-primary/30 transition-colors">
          <CardContent className="pt-6 text-center">
            <HeartPulse className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Health Records</p>
            <p className="text-xs text-muted-foreground">{records.length} records</p>
          </CardContent>
        </Card>
        <Card className="glass-card cursor-pointer hover:border-primary/30 transition-colors">
          <CardContent className="pt-6 text-center">
            <HeartPulse className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Health Assessments</p>
            <p className="text-xs text-muted-foreground">View history</p>
          </CardContent>
        </Card>
        <Card className="glass-card cursor-pointer hover:border-primary/30 transition-colors">
          <CardContent className="pt-6 text-center">
            <HeartPulse className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Referral Records</p>
            <p className="text-xs text-muted-foreground">View referrals</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading">Recent Health Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No health records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Diagnosis</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Medicine</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Provider</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{r.record_date}</TableCell>
                    <TableCell className="text-sm">{r.record_type}</TableCell>
                    <TableCell className="text-sm">{r.diagnosis}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{r.medicine}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{r.provider}</TableCell>
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

export default HealthServices;
