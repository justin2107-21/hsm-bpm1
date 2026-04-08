import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Syringe, TrendingUp, AlertCircle, Check } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const LguVaccination = () => {
  const { data: vaccinations = [] } = useQuery({
    queryKey: ["lgu_vac_data"],
    queryFn: async () => {
      const { data } = await supabase.from("vaccinations").select("*").limit(500);
      return data || [];
    },
  });

  const byVaccine = vaccinations.reduce<Record<string, number>>((acc, v) => {
    acc[v.vaccine || "Unknown"] = (acc[v.vaccine || "Unknown"] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(byVaccine).map(([name, count]) => ({ name, count }));

  const byStatus = vaccinations.reduce<Record<string, number>>((acc, v) => {
    acc[v.status || "Unknown"] = (acc[v.status || "Unknown"] || 0) + 1;
    return acc;
  }, {});
  const statusChart = Object.entries(byStatus).map(([name, count]) => ({ name, count }));

  const completed = vaccinations.filter((v) => v.status === "completed").length;
  const pending = vaccinations.filter((v) => v.status === "pending").length;
  const coverageRate = vaccinations.length ? Math.round((completed / vaccinations.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Vaccination Coverage</h1>
        <p className="text-sm text-muted-foreground">Municipal vaccination program monitoring (read-only)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-l-4 border-l-green-500">
          <CardContent className="pt-4 flex items-center gap-3">
            <Syringe className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Records</p>
              <p className="text-lg font-bold text-green-400">{vaccinations.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-emerald-500">
          <CardContent className="pt-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold text-emerald-400">{completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-yellow-500">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-yellow-400">{pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardContent className="pt-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Coverage Rate</p>
              <p className="text-lg font-bold text-blue-400">{coverageRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading">Vaccinations by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="count" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground)}" width={70} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-blue-500/30 bg-blue-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">📊 Vaccination Insights</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>✓ <span className="text-emerald-400">Coverage Rate: {coverageRate}%</span> - Municipal vaccination target on track</p>
          <p>⏳ <span className="text-yellow-400">Pending Schedules: {pending}</span> - Follow-up appointments needed</p>
          <p>📈 Last updated: {new Date().toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LguVaccination;
