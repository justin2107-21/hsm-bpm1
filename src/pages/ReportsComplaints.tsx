import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  MessageSquare,
  Droplets,
  TreePine,
  HelpCircle,
  AlertTriangle,
  FileText,
  MapPin
} from "lucide-react";

const ReportsComplaints = () => {
  const navigate = useNavigate();

  const reportTypes = [
    {
      id: "disease",
      title: "Disease Report",
      description: "Report suspected disease cases or outbreaks in your area",
      icon: ShieldAlert,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      action: () => navigate("/citizen/disease-reporting")
    },
    {
      id: "sanitation",
      title: "Sanitation Complaint",
      description: "Report sanitation issues, waste management problems, or hygiene concerns",
      icon: MessageSquare,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      action: () => navigate("/citizen/sanitation-complaints")
    },
    {
      id: "wastewater",
      title: "Wastewater / Septic Concern",
      description: "Report wastewater issues, septic tank problems, or drainage concerns",
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      action: () => navigate("/citizen/wastewater-concerns")
    },
    {
      id: "environmental",
      title: "Environmental / Cleanup Report",
      description: "Report environmental issues, illegal dumping, or cleanup needs",
      icon: TreePine,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      action: () => navigate("/citizen/environmental-concerns")
    },
    {
      id: "other",
      title: "Other Concern",
      description: "Report any other issues or concerns not covered above",
      icon: HelpCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      action: () => navigate("/citizen/disease-reporting")
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Reports & Complaints</h1>
        <p className="text-sm text-muted-foreground">
          Help improve our community by reporting issues and concerns. Your reports help us maintain health and sanitation standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card
              key={report.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
              onClick={report.action}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-3`}>
                  <IconComponent className={`h-6 w-6 ${report.color}`} />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {report.description}
                </p>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  File Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Important Information
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• All reports are taken seriously and investigated promptly</li>
                <li>• Anonymous reporting options are available for sensitive issues</li>
                <li>• You will receive updates on the status of your report</li>
                <li>• False reports may result in penalties</li>
                <li>• For emergencies, call emergency services directly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsComplaints;