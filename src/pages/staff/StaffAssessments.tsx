import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";

const StaffAssessments = () => {
  const [citizenId, setCitizenId] = useState("");
  const [form, setForm] = useState({
    height: "",
    weight: "",
    bp: "",
    temp: "",
    symptoms: "",
  });
  const queryClient = useQueryClient();

  const userPrefix = useMemo(() => citizenId.trim().replace("GSMS-2026-", "").toLowerCase(), [citizenId]);

  const { data: profile } = useQuery({
    queryKey: ["staff_assessment_profile", userPrefix],
    queryFn: async () => {
      if (!userPrefix) return null;
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .ilike("user_id", `${userPrefix}%`)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!userPrefix,
  });

  const citizenUserId = profile?.user_id;

  const { data: records = [] } = useQuery({
    queryKey: ["staff_assessment_records", citizenUserId],
    queryFn: async () => {
      if (!citizenUserId) return [];
      const { data } = await supabase
        .from("resident_health_records")
        .select("*")
        .eq("user_id", citizenUserId)
        .order("record_date", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!citizenUserId,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!citizenUserId) throw new Error("Citizen not found");
      const summary = `Height: ${form.height || "—"}, Weight: ${form.weight || "—"}, BP: ${form.bp || "—"}, Temp: ${
        form.temp || "—"
      }`;

      const { error } = await supabase.from("resident_health_records").insert({
        user_id: citizenUserId,
        record_type: "Health Assessment",
        diagnosis: summary,
        medicine: null,
        provider: "Health Center Staff",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_assessment_records", citizenUserId] });
      setForm({ height: "", weight: "", bp: "", temp: "", symptoms: "" });
      toast.success("Assessment saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Citizen Health Assessment</h1>
        <p className="text-sm text-muted-foreground">Record basic vitals and symptoms prior to consultation</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" /> Perform Health Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Citizen ID</Label>
            <Input placeholder="GSMS-2026-XXXXXXXX" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} />
          </div>

          {profile && (
            <div className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">Citizen</p>
              <p className="text-sm font-medium">{profile.full_name}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Height</Label>
              <Input value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="cm" />
            </div>
            <div>
              <Label className="text-xs">Weight</Label>
              <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="kg" />
            </div>
            <div>
              <Label className="text-xs">Blood Pressure</Label>
              <Input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" />
            </div>
            <div>
              <Label className="text-xs">Temperature</Label>
              <Input value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="°C" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Symptoms</Label>
            <Textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} rows={2} />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !citizenUserId}>
              {addMutation.isPending ? "Saving..." : "Save Assessment"}
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/health-center")}>
              Proceed to Consultation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Assessment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {!citizenUserId ? (
            <p className="text-sm text-muted-foreground text-center py-6">Enter a Citizen ID to view assessment records.</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No records found.</p>
          ) : (
            <div className="space-y-2">
              {records
                .filter((r) => r.record_type === "Health Assessment")
                .slice(0, 10)
                .map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{r.record_date}</p>
                      <p className="text-[11px] text-muted-foreground">{r.provider || "—"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{r.diagnosis}</p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAssessments;

