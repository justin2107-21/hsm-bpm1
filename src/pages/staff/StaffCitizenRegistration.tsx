import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const StaffCitizenRegistration = () => {
  const [form, setForm] = useState({
    full_name: "",
    birthdate: "",
    address: "",
    barangay: "",
    contact_number: "",
    email: "",
  });
  const [created, setCreated] = useState<{ email: string; citizenId: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // In a real deployment, this should create an auth user + role + profile.
      // For this demo, create a tracked request for system admins/registration team to fulfill.
      const { error } = await supabase.from("service_requests").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        request_type: "Citizen Registration",
        title: "Walk-in citizen registration",
        description: JSON.stringify(form),
        status: "Submitted",
      });
      if (error) throw error;

      const citizenId = `GSMS-2026-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      setCreated({ email: form.email || "N/A", citizenId });
      toast.success("Registration queued for creation. QR Citizen ID generated for demo.");
      setForm({ full_name: "", birthdate: "", address: "", barangay: "", contact_number: "", email: "" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Citizen Registration</h1>
        <p className="text-sm text-muted-foreground">Register walk-in citizens and generate a QR Citizen ID</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Registration Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Birthdate</Label>
              <Input type="date" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Barangay</Label>
              <Input value={form.barangay} onChange={(e) => setForm({ ...form, barangay: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Contact Number</Label>
              <Input value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Email (optional)</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <Button onClick={handleRegister} disabled={loading || !form.full_name}>
            {loading ? "Submitting..." : "Register Citizen"}
          </Button>

          {created && (
            <div className="mt-4 p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center gap-3">
              <p className="text-sm font-medium">Generated QR Citizen ID (Demo)</p>
              <QRCodeSVG value={created.citizenId} size={180} level="H" />
              <p className="text-xs font-mono text-muted-foreground">{created.citizenId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffCitizenRegistration;

