import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Building2 } from "lucide-react";
import { toast } from "sonner";

const MyEstablishments = () => {
  const { user, userName } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    address: "",
    barangay: "",
    contact_number: "",
    business_permit_number: "",
    issuing_lgu: "",
    permit_expiry_date: "",
  });

  const { data: establishments = [] } = useQuery({
    queryKey: ["citizen_establishments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("establishments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("establishments").insert({
        user_id: user!.id,
        owner_name: userName || "Owner",
        business_name: form.business_name,
        business_type: form.business_type,
        address: form.address,
        barangay: form.barangay,
        contact_number: form.contact_number,
        business_permit_number: form.business_permit_number,
        issuing_lgu: form.issuing_lgu,
        permit_expiry_date: form.permit_expiry_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_establishments"] });
      setOpen(false);
      setForm({ business_name: "", business_type: "", address: "", barangay: "", contact_number: "", business_permit_number: "", issuing_lgu: "", permit_expiry_date: "" });
      toast.success("Establishment registration submitted for verification");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending_verification: "Pending Verification",
      registered: "Registered",
      requires_correction: "Requires Correction",
      rejected: "Rejected",
    };
    return map[s] || s;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Establishments</h1>
          <p className="text-sm text-muted-foreground">Register and manage your business establishments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Register Establishment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">Register New Establishment</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label className="text-xs">Business Name *</Label><Input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} /></div>
              <div><Label className="text-xs">Business Type</Label><Input placeholder="e.g., Food, Retail" value={form.business_type} onChange={e => setForm({ ...form, business_type: e.target.value })} /></div>
              <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label className="text-xs">Barangay</Label><Input value={form.barangay} onChange={e => setForm({ ...form, barangay: e.target.value })} /></div>
              <div><Label className="text-xs">Owner Name</Label><Input value={userName} disabled className="bg-muted" /></div>
              <div><Label className="text-xs">Contact Number</Label><Input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} /></div>
              <div><Label className="text-xs">Business Permit Number</Label><Input value={form.business_permit_number} onChange={e => setForm({ ...form, business_permit_number: e.target.value })} /></div>
              <div><Label className="text-xs">Issuing LGU</Label><Input value={form.issuing_lgu} onChange={e => setForm({ ...form, issuing_lgu: e.target.value })} /></div>
              <div><Label className="text-xs">Business Permit Expiry Date</Label><Input type="date" value={form.permit_expiry_date} onChange={e => setForm({ ...form, permit_expiry_date: e.target.value })} /></div>
              <p className="text-xs text-muted-foreground">After submission, Sanitation Office Staff will verify your registration before approval.</p>
              <Button className="w-full" onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !form.business_name}>
                {addMutation.isPending ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm font-heading">Registered Establishments</CardTitle></CardHeader>
        <CardContent>
          {establishments.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No establishments registered yet.</p>
              <p className="text-xs text-muted-foreground">Click "Register Establishment" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Business Name</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Address</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Permit #</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {establishments.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-sm">{e.business_name}</TableCell>
                    <TableCell className="text-sm">{e.business_type}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{e.address}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{e.business_permit_number}</TableCell>
                    <TableCell><StatusBadge status={statusLabel(e.status)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {establishments.some(e => e.status === "requires_correction" && e.reviewer_notes) && (
            <div className="mt-4 space-y-2">
              {establishments.filter(e => e.reviewer_notes).map(e => (
                <div key={e.id} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-xs font-medium text-destructive">{e.business_name} — Correction Required:</p>
                  <p className="text-xs text-muted-foreground mt-1">{e.reviewer_notes}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyEstablishments;
