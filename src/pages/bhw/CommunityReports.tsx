import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, Send } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

const BARANGAYS = ["Commonwealth", "Batasan Hills", "Holy Spirit", "Payatas", "Bagong Silangan", "Fairview", "Novaliches", "Tandang Sora", "Diliman", "Cubao"];
const DISEASES = ["Dengue", "COVID-19", "Tuberculosis", "Influenza", "Measles", "Cholera", "Other"];

const BhwCommunityReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [disease, setDisease] = useState(DISEASES[0]);
  const [barangay, setBarangay] = useState(BARANGAYS[0]);
  const [details, setDetails] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: cases = [] } = useQuery({
    queryKey: ["bhw_disease_cases"],
    queryFn: async () => {
      const { data } = await supabase
        .from("surveillance_cases")
        .select("*")
        .order("case_date", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("surveillance_cases").insert({
        disease,
        patient_location: barangay,
        details: `Citizen ID: ${citizenId || "N/A"} — ${details}`,
        reported_by: user!.id,
        reporter: "BHW Field Report",
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bhw_disease_cases"] });
      setDetails("");
      setCitizenId("");
      toast.success("Disease case reported");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Community Reports</h1>
        <p className="text-sm text-muted-foreground">Report suspected disease cases in your barangay</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" /> Report Disease Case
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Citizen ID (optional)</Label>
              <Input placeholder="GSMS-2026-XXXXXXXX" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Disease Type</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs" value={disease} onChange={(e) => setDisease(e.target.value)}>
                {DISEASES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Barangay</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs" value={barangay} onChange={(e) => setBarangay(e.target.value)}>
                {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Symptoms / Details</Label>
            <Textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe symptoms and observations..." />
          </div>
          <Button size="sm" className="gap-1" onClick={() => reportMutation.mutate()} disabled={reportMutation.isPending || !details}>
            <Send className="h-4 w-4" /> Submit Disease Report
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Recent Disease Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No disease cases reported.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Disease</TableHead>
                  <TableHead className="text-xs">Barangay</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedCase(c); setDetailOpen(true); }}>
                    <TableCell className="text-sm">{c.case_date}</TableCell>
                    <TableCell className="text-sm">{c.disease}</TableCell>
                    <TableCell className="text-sm">{c.patient_location || "—"}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Disease Case Details</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Disease</p>
                <p className="font-medium">{selectedCase.disease}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{selectedCase.patient_location || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date Reported</p>
                <p className="font-medium">{selectedCase.case_date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Symptoms/Details</p>
                <p className="font-medium text-sm">{selectedCase.details || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium">{selectedCase.status}</p>
              </div>
              {selectedCase.reporter && (
                <div>
                  <p className="text-xs text-muted-foreground">Reported by</p>
                  <p className="font-medium">{selectedCase.reporter}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BhwCommunityReports;
