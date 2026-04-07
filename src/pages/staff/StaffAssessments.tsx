import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { Heart, AlertCircle, Search, X, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Dummy citizens data for search (using UUID format for database compatibility)
const DUMMY_CITIZENS = [
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Maria Santos", email: "maria@example.com" },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Juan dela Cruz", email: "juan@example.com" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Anna Garcia", email: "anna@example.com" },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "Carlos Reyes", email: "carlos@example.com" },
  { id: "550e8400-e29b-41d4-a716-446655440005", name: "Rosa Mendoza", email: "rosa@example.com" },
];

const StaffAssessments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCitizen, setSelectedCitizen] = useState<typeof DUMMY_CITIZENS[0] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"perform" | "records">("perform");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    height: "",
    weight: "",
    bp: "",
    temp: "",
    pulse: "",
    symptoms: "",
  });

  const queryClient = useQueryClient();

  // Handle search filtering
  const filteredCitizens = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearch = searchTerm.toLowerCase();
    return DUMMY_CITIZENS.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.email.toLowerCase().includes(lowerSearch) ||
        c.id.includes(searchTerm)
    );
  }, [searchTerm]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch health records for selected citizen
  const { data: records = [] } = useQuery({
    queryKey: ["staff_assessment_records", selectedCitizen?.id],
    queryFn: async () => {
      if (!selectedCitizen) return [];
      const { data } = await supabase
        .from("resident_health_records")
        .select("*")
        .eq("user_id", selectedCitizen.id)
        .order("record_date", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!selectedCitizen,
  });

  // Fetch all health records for Assessment Records view
  const { data: allRecords = [] } = useQuery({
    queryKey: ["all_assessment_records"],
    queryFn: async () => {
      const { data } = await supabase
        .from("resident_health_records")
        .select("*")
        .order("record_date", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  // Calculate BMI
  const bmi = useMemo(() => {
    if (!form.height || !form.weight) return null;
    const heightM = parseFloat(form.height) / 100;
    const weightKg = parseFloat(form.weight);
    return (weightKg / (heightM * heightM)).toFixed(1);
  }, [form.height, form.weight]);

  const getBmiStatus = (bmiValue: number | string | null) => {
    if (!bmiValue) return null;
    const bmi = parseFloat(String(bmiValue));
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  // Save assessment
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCitizen) throw new Error("Citizen not found");
      const summary = `Height: ${form.height || "—"}cm, Weight: ${form.weight || "—"}kg, BP: ${form.bp || "—"}, Temp: ${form.temp || "—"}°C, Pulse: ${form.pulse || "—"}bpm. Citizen: ${selectedCitizen.name} (${selectedCitizen.email})`;

      const { error } = await supabase.from("resident_health_records").insert({
        user_id: selectedCitizen.id,
        record_type: "Health Assessment",
        diagnosis: summary,
        medicine: null,
        provider: "Health Center Staff",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_assessment_records", selectedCitizen?.id] });
      setForm({ height: "", weight: "", bp: "", temp: "", pulse: "", symptoms: "" });
      toast.success("Assessment saved successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Citizen Health Assessment</h1>
          <p className="text-sm text-muted-foreground">Record basic vitals and health status for citizens</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "perform" ? "default" : "outline"}
            onClick={() => setViewMode("perform")}
            size="sm"
          >
            <Heart className="h-4 w-4 mr-1" />
            Perform Assessment
          </Button>
          <Button
            variant={viewMode === "records" ? "default" : "outline"}
            onClick={() => setViewMode("records")}
            size="sm"
          >
            <FileText className="h-4 w-4 mr-1" />
            Assessment Records
          </Button>
        </div>
      </div>

      {/* Perform Assessment View */}
      {viewMode === "perform" && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" /> Perform Health Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Live Search Dropdown */}
            <div className="relative" ref={searchRef}>
              <Label className="text-xs font-medium">Search Citizen</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-8"
                />
                {selectedCitizen && (
                  <button
                    onClick={() => {
                      setSelectedCitizen(null);
                      setSearchTerm("");
                      setForm({ height: "", weight: "", bp: "", temp: "", pulse: "", symptoms: "" });
                    }}
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {showDropdown && filteredCitizens.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
                  {filteredCitizens.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCitizen(c);
                        setSearchTerm(c.name);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted border-b border-border last:border-b-0 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.email}</span>
                        <span className="text-xs text-muted-foreground">{c.id}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Citizen Info */}
            {selectedCitizen && (
              <div className="p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
                <p className="text-xs text-muted-foreground">Selected Citizen</p>
                <p className="text-sm font-semibold text-foreground">{selectedCitizen.name}</p>
                <p className="text-[11px] text-muted-foreground">{selectedCitizen.email} • {selectedCitizen.id}</p>
              </div>
            )}

            {/* Assessment Form */}
            {selectedCitizen && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Height (cm)</Label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Weight (kg)</Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* BMI Display */}
                {bmi && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">BMI Index</p>
                        <p className="text-lg font-semibold">{bmi}</p>
                      </div>
                      <StatusBadge
                        status={getBmiStatus(bmi) || "Unknown"}
                        variant={getBmiStatus(bmi) === "Normal" ? "success" : getBmiStatus(bmi) === "Underweight" ? "info" : "warning"}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{getBmiStatus(bmi)}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Blood Pressure</Label>
                    <Input
                      placeholder="120/80"
                      value={form.bp}
                      onChange={(e) => setForm({ ...form, bp: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Temperature (°C)</Label>
                    <Input
                      type="number"
                      placeholder="37"
                      step="0.1"
                      value={form.temp}
                      onChange={(e) => setForm({ ...form, temp: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Pulse Rate (bpm)</Label>
                    <Input
                      type="number"
                      placeholder="72"
                      value={form.pulse}
                      onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Status</Label>
                    <div className="mt-1 p-2 rounded-md border border-border bg-muted/20 flex items-center justify-center">
                      <StatusBadge status="Pending" variant="info" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Symptoms/Notes</Label>
                  <Textarea
                    placeholder="Record any symptoms or health observations..."
                    value={form.symptoms}
                    onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => addMutation.mutate()}
                    disabled={addMutation.isPending || !selectedCitizen}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {addMutation.isPending ? "Saving..." : "Save Assessment"}
                  </Button>
                  <Button variant="outline" onClick={() => (window.location.href = "/health-center")}>
                    Proceed to Consultation
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assessment Records View */}
      {viewMode === "records" && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Assessment Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No assessment records found.</p>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Record Type</TableHead>
                      <TableHead className="text-xs">Provider</TableHead>
                      <TableHead className="text-xs">Diagnosis</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                      <TableHead className="text-xs text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRecords
                      .filter((r) => r.record_type === "Health Assessment")
                      .map((r) => (
                        <TableRow
                          key={r.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setSelectedRecord(r);
                            setShowModal(true);
                          }}
                        >
                          <TableCell className="text-xs">{new Date(r.record_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs font-medium">{r.record_type}</TableCell>
                          <TableCell className="text-xs">{r.provider || "—"}</TableCell>
                          <TableCell className="text-xs truncate max-w-xs">{r.diagnosis || "—"}</TableCell>
                          <TableCell className="text-xs text-center">
                            <StatusBadge status="Recorded" variant="success" />
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <button
                              className="text-primary hover:text-primary/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(r);
                                setShowModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assessment Details
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Record ID</p>
                  <p className="text-sm font-mono text-foreground">{selectedRecord.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Date</p>
                  <p className="text-sm font-medium text-foreground">{new Date(selectedRecord.record_date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Record Type</p>
                  <p className="text-sm font-medium text-foreground">{selectedRecord.record_type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Provider</p>
                  <p className="text-sm font-medium text-foreground">{selectedRecord.provider || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Diagnosis/Assessment</p>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedRecord.diagnosis || "No diagnosis recorded"}</p>
                </div>
              </div>

              {selectedRecord.medicine && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Medicine</p>
                  <p className="text-sm text-foreground">{selectedRecord.medicine}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffAssessments;

