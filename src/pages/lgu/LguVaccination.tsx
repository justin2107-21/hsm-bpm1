import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Syringe, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
    acc[v.vaccine] = (acc[v.vaccine] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(byVaccine).map(([name, count]) => ({ name, count }));

  const completed = vaccinations.filter((v) => v.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Vaccination Coverage</h1>
        <p className="text-sm text-muted-foreground">Municipal vaccination program monitoring (read-only)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4 flex items-center gap-3">
            <Syringe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Records</p>
              <p className="text-lg font-bold">{vaccinations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Coverage Rate</p>
              <p className="text-lg font-bold">{vaccinations.length ? Math.round((completed / vaccinations.length) * 100) : 0}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default LguVaccination;
