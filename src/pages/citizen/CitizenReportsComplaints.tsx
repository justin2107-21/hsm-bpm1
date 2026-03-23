import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, ShieldAlert, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const BARANGAYS = [
  "Bungad",
  "Fairview",
  "Commonwealth",
  "Batasan Hills",
  "Bagong Silangan",
  "Sta. Monica",
  "Sta. Lucia",
  "Apollo",
  "Holy Spirit",
];

const DISEASE_TYPES = [
  "Dengue",
  "TB",
  "Flu",
  "COVID-19",
  "Measles",
  "Hepatitis A",
  "Hepatitis B",
  "Typhoid",
  "Other",
];

const COMPLAINT_TYPES = [
  "Clogged Drainage",
  "Drainage blockage",
  "Illegal Dumping",
  "Open Dump",
  "Unsanitary Conditions",
  "Pest Infestation",
  "Other",
];

const CitizenReportsComplaints = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("disease");
  const [diseaseDialogOpen, setDiseaseDialogOpen] = useState(false);
  const [sanitationDialogOpen, setSanitationDialogOpen] = useState(false);
  const [diseaseDetailOpen, setDiseaseDetailOpen] = useState(false);
  const [sanitationDetailOpen, setSanitationDetailOpen] = useState(false);
  const [selectedDiseaseReport, setSelectedDiseaseReport] = useState<any>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [diseaseForm, setDiseaseForm] = useState({ disease: "", diseaseOther: "", location: "", details: "" });
  const [sanitationForm, setSanitationForm] = useState({ complaint_type: "", complaintOther: "", barangay: "", location: "", description: "" });
  const queryClient = useQueryClient();

  // Disease Reports Query
  const { data: cases = [] } = useQuery({
    queryKey: ["citizen_disease_reports", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("disease_reports").select("*").eq("reported_by", user!.id).order("case_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Sanitation Complaints Query
  const { data: complaints = [] } = useQuery({
    queryKey: ["citizen_complaints", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("sanitation_complaints").select("*").eq("citizen_id", user!.id).order("date_submitted", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Disease Report Mutation
  const diseaseReportMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch('/.netlify/functions/submit-disease-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user!.id,
            disease: diseaseForm.disease === "Other" ? diseaseForm.diseaseOther : diseaseForm.disease,
            location: diseaseForm.location,
            details: diseaseForm.details,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit disease report');
        }

        return await response.json();
      } catch (err: any) {
        console.error("Error submitting disease report:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_disease_reports"] });
      setDiseaseDialogOpen(false);
      setDiseaseForm({ disease: "", diseaseOther: "", location: "", details: "" });
      toast.success("Disease report submitted successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Sanitation Complaint Mutation
  const sanitationComplaintMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch('/.netlify/functions/submit-sanitation-complaint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user!.id,
            complaint_type: sanitationForm.complaint_type === "Other" ? sanitationForm.complaintOther : sanitationForm.complaint_type,
            barangay: sanitationForm.barangay,
            location: sanitationForm.location,
            description: sanitationForm.description,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit complaint');
        }

        return await response.json();
      } catch (err: any) {
        console.error("Error submitting complaint:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_complaints"] });
      setSanitationDialogOpen(false);
      setSanitationForm({ complaint_type: "", complaintOther: "", barangay: "", location: "", description: "" });
      toast.success("Complaint submitted successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Reports & Complaints</h1>
        <p className="text-sm text-muted-foreground">Report disease cases and sanitation complaints in your community</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="disease" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Disease Reports
          </TabsTrigger>
          <TabsTrigger value="sanitation" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Sanitation Complaints
          </TabsTrigger>
        </TabsList>

        {/* Disease Report Tab */}
        <TabsContent value="disease">
          <Card className="glass-card">
            <CardHeader className="flex items-center justify-between flex-row pb-3">
              <CardTitle className="text-sm font-heading">Disease Reports</CardTitle>
              <Dialog open={diseaseDialogOpen} onOpenChange={setDiseaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Report Disease Case
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">Report Disease Case</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-xs">Disease / Illness *</Label>
                      <select 
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        value={diseaseForm.disease}
                        onChange={(e) => setDiseaseForm({ ...diseaseForm, disease: e.target.value })}
                      >
                        <option value="">Select a disease</option>
                        {DISEASE_TYPES.map((disease) => (
                          <option key={disease} value={disease}>{disease}</option>
                        ))}
                      </select>
                    </div>
                    {diseaseForm.disease === "Other" && (
                      <div>
                        <Label className="text-xs">Specify Disease *</Label>
                        <Input
                          placeholder="Enter specific disease name"
                          value={diseaseForm.diseaseOther}
                          onChange={(e) => setDiseaseForm({ ...diseaseForm, diseaseOther: e.target.value })}
                        />
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">Location (Barangay) *</Label>
                      <select 
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        value={diseaseForm.location}
                        onChange={(e) => setDiseaseForm({ ...diseaseForm, location: e.target.value })}
                      >
                        <option value="">Select a barangay</option>
                        {BARANGAYS.map((barangay) => (
                          <option key={barangay} value={barangay}>Barangay {barangay}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Details</Label>
                      <Textarea
                        rows={3}
                        placeholder="Describe the case..."
                        value={diseaseForm.details}
                        onChange={(e) => setDiseaseForm({ ...diseaseForm, details: e.target.value })}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => diseaseReportMutation.mutate()}
                      disabled={diseaseReportMutation.isPending || !diseaseForm.disease || !diseaseForm.location || (diseaseForm.disease === "Other" && !diseaseForm.diseaseOther)}
                    >
                      {diseaseReportMutation.isPending ? "Submitting..." : "Submit Report"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No disease reports submitted yet.</p>
                  <p className="text-xs text-muted-foreground mt-2">Click "Report Disease Case" to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Disease</TableHead>
                      <TableHead className="text-xs">Location</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((c) => (
                      <TableRow 
                        key={c.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => {
                          setSelectedDiseaseReport(c);
                          setDiseaseDetailOpen(true);
                        }}
                      >
                        <TableCell className="text-sm">{c.case_date}</TableCell>
                        <TableCell className="text-sm font-medium">{c.disease}</TableCell>
                        <TableCell className="text-sm">{c.patient_location}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sanitation Complaint Tab */}
        <TabsContent value="sanitation">
          <Card className="glass-card">
            <CardHeader className="flex items-center justify-between flex-row pb-3">
              <CardTitle className="text-sm font-heading">Sanitation Complaints</CardTitle>
              <Dialog open={sanitationDialogOpen} onOpenChange={setSanitationDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Report Complaint
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">File a Sanitation Complaint</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-xs">Barangay *</Label>
                      <select 
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        value={sanitationForm.barangay}
                        onChange={(e) => setSanitationForm({ ...sanitationForm, barangay: e.target.value })}
                      >
                        <option value="">Select a barangay</option>
                        {BARANGAYS.map((barangay) => (
                          <option key={barangay} value={barangay}>Barangay {barangay}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Type *</Label>
                      <select 
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        value={sanitationForm.complaint_type}
                        onChange={(e) => setSanitationForm({ ...sanitationForm, complaint_type: e.target.value })}
                      >
                        <option value="">Select complaint type</option>
                        {COMPLAINT_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {sanitationForm.complaint_type === "Other" && (
                      <div>
                        <Label className="text-xs">Specify Complaint Type *</Label>
                        <Input
                          placeholder="Enter specific complaint type"
                          value={sanitationForm.complaintOther}
                          onChange={(e) => setSanitationForm({ ...sanitationForm, complaintOther: e.target.value })}
                        />
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">Location</Label>
                      <Input
                        placeholder="Purok, Street, Landmark"
                        value={sanitationForm.location}
                        onChange={(e) => setSanitationForm({ ...sanitationForm, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        rows={3}
                        placeholder="Describe the complaint..."
                        value={sanitationForm.description}
                        onChange={(e) => setSanitationForm({ ...sanitationForm, description: e.target.value })}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => sanitationComplaintMutation.mutate()}
                      disabled={sanitationComplaintMutation.isPending || !sanitationForm.complaint_type || !sanitationForm.barangay || (sanitationForm.complaint_type === "Other" && !sanitationForm.complaintOther)}
                    >
                      {sanitationComplaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {complaints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No complaints filed yet.</p>
                  <p className="text-xs text-muted-foreground mt-2">Click "Report Complaint" to get started.</p>
                </div>
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
                      <TableRow 
                        key={c.complaint_id || c.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => {
                          setSelectedComplaint(c);
                          setSanitationDetailOpen(true);
                        }}
                      >
                        <TableCell className="text-sm">{c.date_submitted}</TableCell>
                        <TableCell className="text-sm font-medium">{c.complaint_type}</TableCell>
                        <TableCell className="text-sm">{c.location}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disease Report Detail Modal */}
      <Dialog open={diseaseDetailOpen} onOpenChange={setDiseaseDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm">Disease Report Details</DialogTitle>
          </DialogHeader>
          {selectedDiseaseReport && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Reference ID</p>
                <p className="text-sm font-mono">{selectedDiseaseReport.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Date</p>
                <p className="text-sm">{selectedDiseaseReport.case_date}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Disease</p>
                <p className="text-sm">{selectedDiseaseReport.disease}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Location</p>
                <p className="text-sm">{selectedDiseaseReport.patient_location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Details</p>
                <p className="text-sm">{selectedDiseaseReport.details || "No details provided"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                <div className="mt-1"><StatusBadge status={selectedDiseaseReport.status} /></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sanitation Complaint Detail Modal */}
      <Dialog open={sanitationDetailOpen} onOpenChange={setSanitationDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm">Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Reference ID</p>
                <p className="text-sm font-mono">{selectedComplaint.complaint_id || selectedComplaint.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Date</p>
                <p className="text-sm">{selectedComplaint.date_submitted}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Barangay</p>
                <p className="text-sm">{selectedComplaint.barangay}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Complaint Type</p>
                <p className="text-sm">{selectedComplaint.complaint_type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Location</p>
                <p className="text-sm">{selectedComplaint.location || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Description</p>
                <p className="text-sm">{selectedComplaint.description || "No description provided"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                <div className="mt-1"><StatusBadge status={selectedComplaint.status} /></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitizenReportsComplaints;
