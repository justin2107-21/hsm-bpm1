import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Syringe, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const VACCINE_TYPES = [
  "COVID-19",
  "Measles",
  "Polio",
  "DPT",
  "BCG",
  "Hepatitis B",
  "Yellow Fever",
  "Tetanus",
  "Influenza",
  "Pneumococcal",
  "HPV",
  "Varicella",
  "Rotavirus",
];

const HEALTH_CENTERS = [
  "Barangay Health Center",
  "District Health Center",
  "City Hospital",
  "Vaccination Clinic",
  "Mobile Vaccination Unit",
];

const VaccinationNutrition = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<any>(null);
  const [form, setForm] = useState({
    vaccine_type: "",
    patient_name: "",
    preferred_date: "",
    preferred_center: "",
    notes: "",
  });
  const queryClient = useQueryClient();

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["citizen_vaccinations", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("vaccinations")
        .select("*")
        .eq("user_id", user!.id)
        .order("vaccination_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: vaccinationSchedules = [] } = useQuery({
    queryKey: ["vaccination_schedules"],
    queryFn: async () => {
      try {
        const response = await fetch('/.netlify/functions/get-vaccination-schedules');
        if (!response.ok) throw new Error('Failed to fetch schedules');
        const result = await response.json();
        return result.data || [];
      } catch (err) {
        console.error('Error fetching schedules:', err);
        return [];
      }
    },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch('/.netlify/functions/submit-vaccination', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user!.id,
            patient_name: form.patient_name,
            vaccine: form.vaccine_type,
            preferred_date: form.preferred_date,
            health_center: form.preferred_center,
            notes: form.notes,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit vaccination request');
        }

        return await response.json();
      } catch (err: any) {
        console.error("Error submitting vaccination request:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_vaccinations", user?.id] });
      setOpen(false);
      setForm({ vaccine_type: "", patient_name: "", preferred_date: "", preferred_center: "", notes: "" });
      toast.success("Vaccination appointment request submitted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to submit vaccination request"),
  });

  const scheduled = vaccinations.filter(v => v.status === "scheduled");
  const completed = vaccinations.filter(v => v.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Vaccination & Nutrition</h1>
        <p className="text-sm text-muted-foreground">Track vaccination records and nutrition monitoring</p>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Syringe className="h-4 w-4" /> Request Vaccination Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading text-sm">Request Vaccination Appointment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label className="text-xs">Patient Name *</Label>
                <Input
                  value={form.patient_name}
                  onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                  placeholder="Enter patient's name"
                />
              </div>
              <div>
                <Label className="text-xs">Vaccine Type *</Label>
                <Select value={form.vaccine_type} onValueChange={(value) => setForm({ ...form, vaccine_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vaccine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VACCINE_TYPES.map((vaccine) => (
                      <SelectItem key={vaccine} value={vaccine}>
                        {vaccine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Preferred Date</Label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.preferred_date}
                    onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    className="light:text-foreground dark:text-foreground"
                    style={{
                      colorScheme: 'light dark',
                      accentColor: 'currentColor',
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Preferred Health Center</Label>
                  <Select value={form.preferred_center} onValueChange={(value) => setForm({ ...form, preferred_center: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health center" />
                    </SelectTrigger>
                    <SelectContent>
                      {HEALTH_CENTERS.map((center) => (
                        <SelectItem key={center} value={center}>
                          {center}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Notes (optional)</Label>
                <Textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional information for the health center..."
                />
              </div>
              <Button
                className="w-full"
                onClick={() => requestMutation.mutate()}
                disabled={requestMutation.isPending || !form.vaccine_type || !form.patient_name}
              >
                {requestMutation.isPending ? "Submitting..." : "Submit Vaccination Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-4 w-4 text-foreground dark:text-foreground" /> Vaccination Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-sm">Available Vaccination Schedules</DialogTitle>
            </DialogHeader>
            {vaccinationSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No vaccination schedules available</p>
            ) : (
              <div className="space-y-3">
                {vaccinationSchedules.map((schedule: any) => (
                  <Card key={schedule.id} className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{schedule.vaccine}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {schedule.barangay && (
                          <div>
                            <p className="text-muted-foreground">Barangay</p>
                            <p className="font-medium">{schedule.barangay}</p>
                          </div>
                        )}
                        {schedule.schedule_date && (
                          <div>
                            <p className="text-muted-foreground">Schedule Date</p>
                            <p className="font-medium">{schedule.schedule_date}</p>
                          </div>
                        )}
                        {schedule.schedule_time && (
                          <div>
                            <p className="text-muted-foreground">Schedule Time</p>
                            <p className="font-medium">{schedule.schedule_time}</p>
                          </div>
                        )}
                        {schedule.health_center_location && (
                          <div>
                            <p className="text-muted-foreground">Health Center</p>
                            <p className="font-medium">{schedule.health_center_location}</p>
                          </div>
                        )}
                        {schedule.assigned_bhw && (
                          <div>
                            <p className="text-muted-foreground">Assigned BHW</p>
                            <p className="font-medium">{schedule.assigned_bhw}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <Syringe className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{vaccinations.length}</p>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-success">{completed.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-warning">{scheduled.length}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm font-heading">Vaccination Records</CardTitle></CardHeader>
        <CardContent>
          {vaccinations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No vaccination records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Reference ID</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Vaccine</TableHead>
                  <TableHead className="text-xs">Child</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">BHW</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaccinations.map((v) => (
                  <TableRow 
                    key={v.id} 
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => {
                      setSelectedVaccination(v);
                      setDetailModal(true);
                    }}
                  >
                    <TableCell className="text-xs font-mono text-muted-foreground">{v.id}</TableCell>
                    <TableCell className="text-sm">{v.vaccination_date}</TableCell>
                    <TableCell className="text-sm">{v.vaccine}</TableCell>
                    <TableCell className="text-sm">{v.patient_name}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{v.bhw_name}</TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailModal} onOpenChange={setDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm">Vaccination Record Details</DialogTitle>
          </DialogHeader>
          {selectedVaccination && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Reference ID</p>
                  <p className="text-sm font-mono">{selectedVaccination.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Date</p>
                  <p className="text-sm">{selectedVaccination.vaccination_date}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Vaccine</p>
                  <p className="text-sm">{selectedVaccination.vaccine}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Child Name</p>
                  <p className="text-sm">{selectedVaccination.patient_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">BHW Name</p>
                  <p className="text-sm">{selectedVaccination.bhw_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                  <div className="mt-1"><StatusBadge status={selectedVaccination.status} /></div>
                </div>
              </div>
              {selectedVaccination.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Notes</p>
                  <p className="text-sm">{selectedVaccination.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VaccinationNutrition;
