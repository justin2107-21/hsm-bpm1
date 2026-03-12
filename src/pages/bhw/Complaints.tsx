import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

const COMPLAINT_TYPES = ["Blocked Drainage", "Septic Leakage", "Improper Waste Disposal", "Unsanitary Establishment", "Other"];
const BARANGAYS = ["Commonwealth", "Batasan Hills", "Holy Spirit", "Payatas", "Bagong Silangan", "Fairview", "Novaliches", "Tandang Sora", "Diliman", "Cubao"];

const BhwComplaints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [type, setType] = useState(COMPLAINT_TYPES[0]);
  const [barangay, setBarangay] = useState(BARANGAYS[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const { data: complaints = [] } = useQuery({
    queryKey: ["bhw_complaints"],
    queryFn: async () => {
      const { data } = await supabase
        .from("wastewater_complaints")
        .select("*")
        .order("complaint_date", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("wastewater_complaints").insert({
        complainant: "BHW Field Report",
        complaint_type: type,
        description: `Barangay: ${barangay} — ${description}`,
        location: location || barangay,
        filed_by: user!.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bhw_complaints"] });
      setDescription("");
      setLocation("");
      toast.success("Sanitation complaint submitted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Sanitation Complaints</h1>
        <p className="text-sm text-muted-foreground">Report sanitation issues within the barangay</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Report Sanitation Complaint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Complaint Type</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs" value={type} onChange={(e) => setType(e.target.value)}>
                {COMPLAINT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Barangay</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs" value={barangay} onChange={(e) => setBarangay(e.target.value)}>
                {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input placeholder="Street / Purok" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the sanitation issue..." />
          </div>
          <Button size="sm" className="gap-1" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !description}>
            <Send className="h-4 w-4" /> Submit Complaint
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Complaint History</CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No complaints recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">{c.complaint_date}</TableCell>
                    <TableCell className="text-sm">{c.complaint_type}</TableCell>
                    <TableCell className="text-sm">{c.location || "—"}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
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

export default BhwComplaints;
