import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { FileCheck, Plus } from "lucide-react";

const SanitaryPermitApplication = () => {
  const { user } = useAuth();

  const { data: permits = [] } = useQuery({
    queryKey: ["citizen_sanitary_permits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resident_permits").select("*").order("application_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Sanitary Permit Applications</h1>
          <p className="text-sm text-muted-foreground">Apply for and track sanitary permits</p>
        </div>
        <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Apply for Permit</Button>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm font-heading">My Applications</CardTitle></CardHeader>
        <CardContent>
          {permits.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No permit applications found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Business</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Applied</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">{p.business_name}</TableCell>
                    <TableCell className="text-sm">{p.business_type}</TableCell>
                    <TableCell className="text-sm">{p.application_date}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
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

export default SanitaryPermitApplication;
