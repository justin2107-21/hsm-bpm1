import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const StaffPermitVerification = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: establishments = [] } = useQuery({
    queryKey: ["staff_establishments_verification"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return establishments;
    return establishments.filter(
      (e) =>
        e.business_name.toLowerCase().includes(q) ||
        (e.business_type || "").toLowerCase().includes(q) ||
        (e.barangay || "").toLowerCase().includes(q),
    );
  }, [establishments, search]);

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("establishments")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_establishments_verification"] });
      toast.success("Verification status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Sanitation Permit Document Verification</h1>
        <p className="text-sm text-muted-foreground">
          Verify establishment registration details and submitted permit documents before inspection scheduling
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search business name, type, or barangay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No establishments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Business</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Barangay</TableHead>
                  <TableHead className="text-xs">Permit Status</TableHead>
                  <TableHead className="text-xs w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm font-medium">{e.business_name}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{e.business_type || "—"}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{e.barangay || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={e.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          onClick={() => verifyMutation.mutate({ id: e.id, status: "registered" })}
                          disabled={verifyMutation.isPending}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          onClick={() => verifyMutation.mutate({ id: e.id, status: "requires_correction" })}
                          disabled={verifyMutation.isPending}
                        >
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Request Docs
                        </Button>
                      </div>
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

export default StaffPermitVerification;

