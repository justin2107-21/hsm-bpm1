import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

const CitizenQR = () => {
  const { user, userName } = useAuth();
  const citizenId = `GSMS-2026-${user?.id?.slice(0, 8).toUpperCase() || "UNKNOWN"}`;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">My QR Citizen ID</h1>
        <p className="text-sm text-muted-foreground">Your unique QR code for health and sanitation services</p>
      </div>
      <div className="max-w-sm mx-auto">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-heading">Digital Citizen ID</CardTitle>
            {userName && <p className="text-xs text-muted-foreground">{userName}</p>}
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <QRCodeSVG value={citizenId} size={180} level="H" />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Citizen ID</p>
              <p className="text-sm font-mono font-semibold">{citizenId}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" className="flex-1 gap-1">
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handlePrint}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitizenQR;
