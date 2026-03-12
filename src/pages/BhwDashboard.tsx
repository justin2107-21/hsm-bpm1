import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  UserPlus,
  Syringe,
  ShieldAlert,
  ClipboardList,
  FileText,
} from "lucide-react";

const BhwDashboard = () => {
  const { userName } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Barangay Health Worker Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {userName ? `Field operations for ${userName}` : "Assist citizens, log cases, and monitor barangay health."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="glass-card cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate("/bhw/citizen-assistance")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" /> Citizen Assistance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Scan QR Citizen ID, search citizens, and assist with registration.
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/citizen-assistance")}>
                Scan QR Citizen ID
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/citizen-assistance")}>
                Register Citizen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate("/bhw/health-programs")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Syringe className="h-4 w-4 text-primary" /> Vaccination Programs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              View vaccination schedules and assist citizens with vaccination requests.
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/health-programs")}>
                Assist Vaccination Request
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/health-programs")}>
                View Vaccination Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate("/bhw/community-reports")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" /> Disease Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Log suspected disease cases and review barangay disease reports.
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/community-reports")}>
                Report Disease Case
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/community-reports")}>
                View Disease Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate("/bhw/complaints")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" /> Sanitation Complaints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Submit sanitation complaints reported by residents and monitor status.
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/complaints")}>
                Report Sanitation Complaint
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/complaints")}>
                View Complaints
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate("/bhw/requests")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" /> Assisted Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Submit and track health and sanitation requests on behalf of citizens.
            </p>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/requests")}>
                Submit Request for Citizen
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/requests")}>
                Track Requests
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate("/bhw/barangay-health")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Barangay Health Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              View disease trends, vaccination coverage, and program participation in your barangay.
            </p>
            <Button variant="outline" size="sm" className="justify-start text-xs" onClick={() => navigate("/bhw/barangay-health")}>
              Open Barangay Health Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BhwDashboard;

