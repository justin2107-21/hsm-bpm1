import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

const HealthCenterServices = () => {
  const { currentRole } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [selectedConsult, setSelectedConsult] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    age: "",
    address: "",
    symptoms: "",
    diagnosis: "",
    medicine: "",
    notes: "",
  });
  const isCaptain = currentRole === "Captain_User";
  const queryClient = useQueryClient();

  const { data: consultations = [] } = useQuery({
    queryKey: ["consultations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .order("consultation_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("consultations").insert({
        patient_name: form.patient_name,
        age: parseInt(form.age) || null,
        address: form.address,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        medicine: form.medicine,
        notes: form.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      setOpen(false);
      setForm({
        patient_name: "",
        age: "",
        address: "",
        symptoms: "",
        diagnosis: "",
        medicine: "",
        notes: "",
      });
      toast.success("Consultation saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredConsults = consultations.filter((c: any) => {
    const matchesSearch =
      (c.patient_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.diagnosis ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Health Center Services</h1>
          <p className="text-sm text-muted-foreground">Patient consultations and health records</p>
        </div>
        {!isCaptain && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add Consultation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">New Consultation</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Patient Name</Label>
                    <Input
                      placeholder="Full name"
                      value={form.patient_name}
                      onChange={(e) =>
                        setForm({ ...form, patient_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Age</Label>
                    <Input
                      type="number"
                      placeholder="Age"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Address</Label>
                  <Input
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Symptoms</Label>
                  <Textarea
                    placeholder="Describe symptoms..."
                    rows={2}
                    value={form.symptoms}
                    onChange={(e) =>
                      setForm({ ...form, symptoms: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Diagnosis</Label>
                    <Input
                      placeholder="Diagnosis"
                      value={form.diagnosis}
                      onChange={(e) =>
                        setForm({ ...form, diagnosis: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Medicine Given</Label>
                    <Input
                      placeholder="Medicine"
                      value={form.medicine}
                      onChange={(e) =>
                        setForm({ ...form, medicine: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    placeholder="Additional notes..."
                    rows={2}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending || !form.patient_name}
                >
                  {addMutation.isPending ? "Saving..." : "Save Consultation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Consultations ({filteredConsults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConsults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No consultations found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Age</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Diagnosis</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsults.map((c: any) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedConsult(c);
                        setDetailOpen(true);
                      }}
                    >
                      <TableCell className="font-medium text-sm">
                        {c.patient_name}
                      </TableCell>
                      <TableCell className="text-sm">{c.age}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">
                        {c.consultation_date}
                      </TableCell>
                      <TableCell className="text-sm hidden lg:table-cell">
                        {c.diagnosis}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConsult(c);
                            setDetailOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation Detail Modal */}
      {selectedConsult && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Consultation Record - {selectedConsult.patient_name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Patient Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {selectedConsult.patient_name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age:</span>{" "}
                    {selectedConsult.age}
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>{" "}
                    {selectedConsult.address || "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {selectedConsult.consultation_date}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <StatusBadge status={selectedConsult.status} />
                  </div>
                </div>
              </div>

              {selectedConsult.symptoms && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Symptoms</h3>
                  <p className="text-sm">{selectedConsult.symptoms}</p>
                </div>
              )}

              {selectedConsult.diagnosis && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Diagnosis</h3>
                  <p className="text-sm">{selectedConsult.diagnosis}</p>
                </div>
              )}

              {selectedConsult.medicine && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Treatment</h3>
                  <p className="text-sm">{selectedConsult.medicine}</p>
                </div>
              )}

              {selectedConsult.notes && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Notes</h3>
                  <p className="text-sm">{selectedConsult.notes}</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDetailOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HealthCenterServices;
