import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { FileCheck, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SanitaryPermitApplication = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    address: "",
  });
  const queryClient = useQueryClient();

  const { data: establishments = [] } = useQuery({
    queryKey: ["citizen_establishments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("establishments").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: permits = [] } = useQuery({
    queryKey: ["citizen_sanitary_permits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resident_permits").select("*").order("application_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEstablishmentId) {
        throw new Error("Please select an establishment");
      }
      const { data, error } = await supabase.from("resident_permits").insert({
        business_name: form.business_name,
        business_type: form.business_type || null,
        status: "Submitted",
      }).select("id").single();
      if (error) throw error;

      await supabase.from("service_requests").insert({
        user_id: user!.id,
        request_type: "Sanitary Permit Application",
        title: `Sanitary permit — ${form.business_name}`,
        description: `Business type: ${form.business_type || "N/A"}; Establishment ID: ${selectedEstablishmentId}`,
        status: "Submitted",
        reference_id: data.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_sanitary_permits", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["citizen_requests_summary", user?.id] });
      setOpen(false);
      setSelectedEstablishmentId("");
      setForm({ business_name: "", business_type: "", address: "" });
      toast.success("Sanitary permit application submitted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEstablishmentSelect = (estId: string) => {
    setSelectedEstablishmentId(estId);
    const establishment = establishments.find((e: any) => e.id === estId);
    if (establishment) {
      setForm({
        business_name: establishment.business_name,
        business_type: establishment.business_type,
        address: establishment.address || "",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Sanitary Permit Applications</h1>
          <p className="text-sm text-muted-foreground">Apply for and track sanitary permits</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Apply for Sanitary Permit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading text-sm">New Sanitary Permit Application</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label className="text-xs">Select Your Establishment *</Label>
                {establishments.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No registered establishments found. Please register one first.</p>
                ) : (
                  <Select value={selectedEstablishmentId} onValueChange={handleEstablishmentSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose establishment" />
                    </SelectTrigger>
                    <SelectContent>
                      {establishments.map((est: any) => (
                        <SelectItem key={est.id} value={est.id}>
                          {est.business_name} ({est.business_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label className="text-xs">Business Name (Read-only)</Label>
                <Input value={form.business_name} disabled className="bg-muted" />
              </div>
              <div>
                <Label className="text-xs">Business Type (Read-only)</Label>
                <Input value={form.business_type} disabled className="bg-muted" />
              </div>
              <Button
                className="w-full"
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isPending || !selectedEstablishmentId}
              >
                {addMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
