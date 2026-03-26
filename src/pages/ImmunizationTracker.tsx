import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Syringe, TrendingUp, CheckCircle, Clock, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const VaccinationAnalytics = () => {
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [vaccineFilter, setVaccineFilter] = useState("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["vaccinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*")
        .order("vaccination_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Aggregate vaccination data
  const stats = useMemo(() => {
    const completed = vaccinations.filter((v: any) => v.status === "completed").length;
    const pending = vaccinations.filter((v: any) => v.status === "scheduled").length;
    const coverage = vaccinations.length > 0 ? Math.round((completed / vaccinations.length) * 100) : 0;
    
    return {
      total: vaccinations.length,
      fullyCovered: completed,
      pending: pending,
      coverage,
    };
  }, [vaccinations]);

  // Get unique barangays and vaccines
  const barangays = useMemo(() => {
    const unique = [...new Set(vaccinations.map((v: any) => v.barangay).filter(Boolean))];
    return unique.sort();
  }, [vaccinations]);

  const vaccines = useMemo(() => {
    const unique = [...new Set(vaccinations.map((v: any) => v.vaccine).filter(Boolean))];
    return unique.sort();
  }, [vaccinations]);

  // Filter vaccinations based on criteria
  const filteredVaccinations = useMemo(() => {
    let filtered = vaccinations;

    if (barangayFilter !== "all") {
      filtered = filtered.filter((v: any) => v.barangay === barangayFilter);
    }

    if (vaccineFilter !== "all") {
      filtered = filtered.filter((v: any) => v.vaccine === vaccineFilter);
    }

    if (dateStart) {
      filtered = filtered.filter((v: any) => v.vaccination_date >= dateStart);
    }

    if (dateEnd) {
      filtered = filtered.filter((v: any) => v.vaccination_date <= dateEnd);
    }

    return filtered;
  }, [vaccinations, barangayFilter, vaccineFilter, dateStart, dateEnd]);

  // Vaccination by Barangay
  const barangayData = useMemo(() => {
    const byBarangay: Record<string, number> = {};
    filteredVaccinations.forEach((v: any) => {
      const barangay = v.barangay || "Unknown";
      byBarangay[barangay] = (byBarangay[barangay] || 0) + 1;
    });
    return Object.entries(byBarangay)
      .map(([barangay, count]) => ({ barangay, vaccinated: count }))
      .sort((a, b) => b.vaccinated - a.vaccinated);
  }, [filteredVaccinations]);

  // Vaccination by Age Group
  const ageGroupData = useMemo(() => {
    const ageGroups: Record<string, number> = {
      "0-5 years": 0,
      "6-12 years": 0,
      "13-18 years": 0,
      "19-35 years": 0,
      "36-50 years": 0,
      "50+ years": 0,
    };

    filteredVaccinations.forEach((v: any) => {
      const age = parseInt(v.age) || 0;
      if (age <= 5) ageGroups["0-5 years"]++;
      else if (age <= 12) ageGroups["6-12 years"]++;
      else if (age <= 18) ageGroups["13-18 years"]++;
      else if (age <= 35) ageGroups["19-35 years"]++;
      else if (age <= 50) ageGroups["36-50 years"]++;
      else ageGroups["50+ years"]++;
    });

    return Object.entries(ageGroups)
      .map(([group, count]) => ({ group, count }));
  }, [filteredVaccinations]);

  // Monthly Vaccination Trends
  const monthlyTrends = useMemo(() => {
    const byMonth: Record<string, number> = {};
    vaccinations.forEach((v: any) => {
      if (v.vaccination_date) {
        const month = v.vaccination_date.substring(0, 7);
        byMonth[month] = (byMonth[month] || 0) + 1;
      }
    });

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        vaccinations: count,
      }));
  }, [vaccinations]);

  // Summary table data: Vaccine Type + Barangay aggregation
  const summaryTableData = useMemo(() => {
    const summary: Record<string, { vaccine: string; barangay: string; count: number; status: string }> = {};
    
    filteredVaccinations.forEach((v: any) => {
      const key = `${v.vaccine}-${v.barangay}`;
      if (!summary[key]) {
        summary[key] = {
          vaccine: v.vaccine || "Unknown",
          barangay: v.barangay || "Unknown",
          count: 0,
          status: v.status || "scheduled",
        };
      }
      summary[key].count++;
    });

    return Object.values(summary);
  }, [filteredVaccinations]);

  // Export to CSV
  const handleExportCSV = () => {
    const header = ["Vaccine", "Barangay", "Total Vaccinated", "Status"];
    const rows = summaryTableData.map((row) => [
      row.vaccine,
      row.barangay,
      row.count,
      row.status,
    ]);

    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vaccination-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Vaccination Analytics & Coverage</h1>
          <p className="text-sm text-muted-foreground">Municipal vaccination monitoring and trend analysis (READ-ONLY)</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={handleExportCSV}>
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Vaccinated"
          value={String(stats.total)}
          icon={CheckCircle}
          description="All records"
        />
        <StatCard
          title="Fully Immunized"
          value={String(stats.fullyCovered)}
          icon={Syringe}
          description="Completed"
        />
        <StatCard
          title="Pending Vaccinations"
          value={String(stats.pending)}
          icon={Clock}
          description="Scheduled"
        />
        <StatCard
          title="Coverage %"
          value={`${stats.coverage}%`}
          icon={TrendingUp}
          description="Achievement"
        />
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium">Barangay</label>
              <select
                value={barangayFilter}
                onChange={(e) => setBarangayFilter(e.target.value)}
                className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm mt-1"
              >
                <option value="all">All Barangays</option>
                {barangays.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Vaccine Type</label>
              <select
                value={vaccineFilter}
                onChange={(e) => setVaccineFilter(e.target.value)}
                className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm mt-1"
              >
                <option value="all">All Vaccines</option>
                {vaccines.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">From Date</label>
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium">To Date</label>
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="h-8 text-sm mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vaccination by Barangay */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-heading">Vaccination by Barangay</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barangayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="barangay" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
                <Bar dataKey="vaccinated" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Group Distribution */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-heading">Vaccinations by Age Group</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ageGroupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="group" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
                <Bar dataKey="count" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-heading">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
                <Line type="monotone" dataKey="vaccinations" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table - READ ONLY */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Vaccination Summary ({summaryTableData.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryTableData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No vaccination data matches the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Vaccine Type</TableHead>
                    <TableHead className="text-xs">Barangay</TableHead>
                    <TableHead className="text-xs">Total Vaccinated</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryTableData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-sm">{row.vaccine}</TableCell>
                      <TableCell className="text-sm">{row.barangay}</TableCell>
                      <TableCell className="text-sm font-semibold">{row.count}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(row);
                            setDetailOpen(true);
                          }}
                        >
                          View Report
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

      {/* Detail Report Modal - READ ONLY */}
      {selectedReport && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vaccination Report - {selectedReport.vaccine} ({selectedReport.barangay})</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-sm">Report Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Vaccine:</span> <br />
                    <span className="font-medium text-base">{selectedReport.vaccine}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Barangay:</span> <br />
                    <span className="font-medium text-base">{selectedReport.barangay}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Vaccinated:</span> <br />
                    <span className="font-medium text-lg text-primary">{selectedReport.count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span> <br />
                    <StatusBadge status={selectedReport.status} />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  📊 <strong>Analytics Dashboard:</strong> This report shows aggregated vaccination data for monitoring purposes only.
                  Individual patient record management is handled by BHW staff.
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setDetailOpen(false)}>
                Close Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VaccinationAnalytics;
