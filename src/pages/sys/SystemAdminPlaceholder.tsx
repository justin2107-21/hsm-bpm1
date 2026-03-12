import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SystemAdminPlaceholder = ({ title }: { title: string }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">{title}</h1>
        <p className="text-sm text-muted-foreground">
          This panel is ready for wiring to logs, integrations, and database controls.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-heading">Coming Next</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add real-time log streaming, integration health checks, backup controls, and workflow retry tooling.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAdminPlaceholder;

