import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, FileText, Syringe, ShieldAlert, ClipboardCheck } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(152, 60%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(217, 91%, 60%)"];

const LguAnalytics = () => {
  const { data: requests = [] } = useQuery({
    queryKey: ["lgu_analytics_requests"],
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("id, request_type, status").limit(500);
      return data || [];
    },
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["lgu_analytics_cases"],
    queryFn: async () => {
      const { data } = await supabase.from("surveillance_cases").select("id, disease, status, case_count").limit(500);
      return data || [];
    },
  });

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["lgu_analytics_vac"],
    queryFn: async () => {
      const { data } = await supabase.from("vaccinations").select("id, status").limit(500);
      return data || [];
    },
  });

  const { data: permits = [] } = useQuery({
    queryKey: ["lgu_analytics_permits"],
    queryFn: async () => {
      const { data } = await supabase.from("sanitation_permits").select("id, status").limit(500);
      return data || [];
    },
  });

  // Request by type
  const reqByType = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.request_type] = (acc[r.request_type] || 0) + 1;
    return acc;
  }, {});
  const reqChartData = Object.entries(reqByType).map(([name, value]) => ({ name, value }));

  // Permit by status
  const permitByStatus = permits.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const permitChartData = Object.entries(permitByStatus).map(([name, value]) => ({ name, value }));

  const activeCases = cases.filter((c) => c.status === "active").reduce((s, c) => s + c.case_count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Municipal Analytics</h1>
        <p className="text-sm text-muted-foreground">Strategic health and sanitation insights for LGU leadership</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Service Requests</p>
              <p className="text-lg font-bold">{requests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Active Disease Cases</p>
              <p className="text-lg font-bold">{activeCases}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 flex items-center gap-3">
            <Syringe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Vaccinations</p>
              <p className="text-lg font-bold">{vaccinations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Permits</p>
              <p className="text-lg font-bold">{permits.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading">Requests by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reqChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Total Request Types: {reqChartData.length} | Total Requests: {reqChartData.reduce((sum, item) => sum + item.value, 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading">Permit Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie 
                  data={permitChartData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={85} 
                  dataKey="value" 
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {permitChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ cursor: 'pointer' }} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }}
                  formatter={(value, name, props) => [`Count: ${value}`, props.payload.name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Total Permits: {permitChartData.reduce((sum, item) => sum + item.value, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LguAnalytics;
