import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Activity, AlertTriangle, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

const weeklyTrend = [
  { week: "W1", dengue: 2, flu: 8, tb: 1 },
  { week: "W2", dengue: 3, flu: 5, tb: 2 },
  { week: "W3", dengue: 5, flu: 12, tb: 1 },
  { week: "W4", dengue: 4, flu: 6, tb: 0 },
];

const HealthSurveillance = () => {
  const { currentRole } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [form, setForm] = useState({ disease: "", case_count: "", case_date: "", patient_location: "", details: "" });
  const isBHW = currentRole === "BHW_User";
  const queryClient = useQueryClient();

  const { data: cases = [] } = useQuery({
    queryKey: ["surveillance_cases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("surveillance_cases").select("*").order("case_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("surveillance_cases").insert({
        disease: form.disease,
        case_count: parseInt(form.case_count) || 1,
        case_date: form.case_date || new Date().toISOString().split("T")[0],
        patient_location: form.patient_location,
        details: form.details,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveillance_cases"] });
      setOpen(false);
      setForm({ disease: "", case_count: "", case_date: "", patient_location: "", details: "" });
      toast.success("Case reported");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { caseId: string; status: string }) => {
      const { error } = await supabase
        .from("surveillance_cases")
        .update({ status: payload.status })
        .eq("id", payload.caseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveillance_cases"] });
      toast.success("Case status updated");
      setDetailOpen(false);
      setSelectedCase(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeCases = cases.filter(c => c.status === "active");
  const resolvedCases = cases.filter(c => c.status === "resolved");

  // Filter cases based on search and status
  const filteredCases = cases.filter((c) => {
    const matchesSearch = 
      (c.disease ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.patient_location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Build bar chart data from real cases
  const diseaseBarData = Object.entries(
    cases.reduce((acc: Record<string, number>, c) => {
      acc[c.disease] = (acc[c.disease] || 0) + c.case_count;
      return acc;
    }, {})
  ).map(([disease, cases]) => ({ disease, cases }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Health Surveillance System</h1>
          <p className="text-sm text-muted-foreground">Disease case reporting and public health monitoring</p>
        </div>
        <div className="flex gap-2">
          {(currentRole === "Clerk_User" || currentRole === "Captain_User" || currentRole === "SysAdmin_User") && (
            <Button size="sm" variant="outline" className="gap-1">
              <FileText className="h-4 w-4" /> Generate Monthly Report
            </Button>
          )}
          {(isBHW || currentRole === "Clerk_User") && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Report Case</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-heading">Report Disease Case</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div><Label className="text-xs">Disease</Label><Input placeholder="e.g., Dengue" value={form.disease} onChange={(e) => setForm({ ...form, disease: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Number of Cases</Label><Input type="number" value={form.case_count} onChange={(e) => setForm({ ...form, case_count: e.target.value })} /></div>
                    <div><Label className="text-xs">Date</Label><Input type="date" value={form.case_date} onChange={(e) => setForm({ ...form, case_date: e.target.value })} /></div>
                  </div>
                  <div><Label className="text-xs">Location</Label><Input placeholder="Purok, Barangay" value={form.patient_location} onChange={(e) => setForm({ ...form, patient_location: e.target.value })} /></div>
                  <div><Label className="text-xs">Details</Label><Textarea rows={2} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></div>
                  <Button className="w-full" onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !form.disease}>
                    {addMutation.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Cases" value={String(activeCases.reduce((s, c) => s + c.case_count, 0))} icon={AlertTriangle} />
        <StatCard title="Cases This Month" value={String(cases.length)} icon={Activity} />
        <StatCard title="Resolved This Month" value={String(resolvedCases.length)} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-sm font-heading">Weekly Disease Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
                <Line type="monotone" dataKey="dengue" stroke="hsl(var(--chart-red))" strokeWidth={2} />
                <Line type="monotone" dataKey="flu" stroke="hsl(var(--chart-blue))" strokeWidth={2} />
                <Line type="monotone" dataKey="tb" stroke="hsl(var(--chart-orange))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-sm font-heading">Cases by Disease</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={diseaseBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="disease" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search disease or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="verified">Verified</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No cases found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Disease</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Cases</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedCase(c);
                        setDetailOpen(true);
                      }}
                    >
                      <TableCell className="font-medium text-sm">{c.disease}</TableCell>
                      <TableCell className="text-sm">{c.patient_location}</TableCell>
                      <TableCell className="text-sm">{c.case_count}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{c.case_date}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(c);
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

      {/* Case Detail Modal */}
      {selectedCase && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Disease Case Report - {selectedCase.disease}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Case Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Disease:</span> {selectedCase.disease}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Number of Cases:</span> {selectedCase.case_count}
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Location:</span> {selectedCase.patient_location}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date Reported:</span> {selectedCase.case_date}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedCase.status} />
                  </div>
                </div>
              </div>

              {selectedCase.details && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Details</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedCase.details}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-sm">Actions</h3>
                <div className="flex flex-col gap-2">
                  {selectedCase.status !== "investigating" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          caseId: selectedCase.id,
                          status: "investigating",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark as Under Investigation
                    </Button>
                  )}
                  {selectedCase.status !== "verified" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          caseId: selectedCase.id,
                          status: "verified",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark as Verified Case
                    </Button>
                  )}
                  {selectedCase.status !== "closed" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          caseId: selectedCase.id,
                          status: "closed",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      Close Case
                    </Button>
                  )}
                </div>
              </div>

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

export default HealthSurveillance;
