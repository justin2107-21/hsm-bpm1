import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Building2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

const LguSanitation = () => {
  const { data: permits = [] } = useQuery({
    queryKey: ["lgu_san_permits"],
    queryFn: async () => {
      const { data } = await supabase.from("sanitation_permits").select("*").order("application_date", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: establishments = [] } = useQuery({
    queryKey: ["lgu_san_establishments"],
    queryFn: async () => {
      const { data } = await supabase.from("establishments").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Sanitation & Inspections</h1>
        <p className="text-sm text-muted-foreground">Municipal sanitation permit and establishment monitoring (read-only)</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" /> Sanitation Permits ({permits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No permits found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Business</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.slice(0, 20).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.business_name}</TableCell>
                    <TableCell className="text-sm">{p.owner_name}</TableCell>
                    <TableCell className="text-sm">{p.application_date}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Establishments ({establishments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {establishments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No establishments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Business</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Barangay</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {establishments.slice(0, 20).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">{e.business_name}</TableCell>
                    <TableCell className="text-sm">{e.business_type || "—"}</TableCell>
                    <TableCell className="text-sm">{e.barangay || "—"}</TableCell>
                    <TableCell><StatusBadge status={e.status} /></TableCell>
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

export default LguSanitation;
