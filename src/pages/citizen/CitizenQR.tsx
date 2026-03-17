import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

const CitizenQR = () => {
  const { user, userName, citizenData } = useAuth();
  const [citizenId, setCitizenId] = useState<string>("");

  // Generate or retrieve citizen ID
  useEffect(() => {
    if (user?.id) {
      // Check if citizen ID already exists in localStorage or generate new one
      const storedId = localStorage.getItem(`citizen_id_${user.id}`);
      if (storedId && storedId.length >= 8) {
        setCitizenId(storedId);
      } else {
        // Generate new 8-character alphanumeric ID
        const newId = nanoid(8).toUpperCase();
        localStorage.setItem(`citizen_id_${user.id}`, newId);
        setCitizenId(newId);
      }
    }
  }, [user?.id]);

  // Create QR code data
  const qrData = JSON.stringify({
    citizen_id: citizenId,
    name: userName || "Unknown",
    email: user?.email || "",
    type: "citizen"
  });

  const handlePrint = () => {
    const svg = document.getElementById("citizen-qr-svg") as unknown as SVGSVGElement | null;
    const qrMarkup = svg ? svg.outerHTML : "";

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=480,height=640");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>My QR Citizen ID</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              background: #f3f4f6;
              color: #111827;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .wrapper {
              text-align: center;
              padding: 24px 20px;
            }
            .title {
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .id-label {
              font-size: 11px;
              color: #6b7280;
              margin-top: 12px;
            }
            .id-value {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              font-size: 13px;
              font-weight: 600;
              margin-top: 4px;
            }
            .qr-frame {
              display: inline-flex;
              padding: 16px;
              border-radius: 16px;
              border: 1px solid #e5e7eb;
              background: #ffffff;
              box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
            }
            svg {
              width: 200px;
              height: 200px;
            }
            @media print {
              body {
                background: #ffffff;
                min-height: auto;
              }
              .wrapper {
                box-shadow: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="title">MY QR CITIZEN ID</div>
            <div class="qr-frame">
              ${qrMarkup}
            </div>
            <div class="id-label">Citizen ID</div>
            <div class="id-value">${citizenId}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">My QR Citizen ID</h1>
        <p className="text-sm text-muted-foreground">Your unique QR code for health and sanitation services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Personal Information - Left Side */}
        {citizenData && (
          <Card className="glass-card h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Personal Information</CardTitle>
              <p className="text-sm text-muted-foreground">Your registered personal details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm">
                    {citizenData.first_name || ''} {citizenData.middle_name || ''} {citizenData.last_name || ''} {citizenData.suffix || ''}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{citizenData.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{citizenData.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-sm">{citizenData.address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Barangay</label>
                  <p className="text-sm">{citizenData.barangay || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Zip Code</label>
                  <p className="text-sm">{citizenData.zip_code || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="text-sm">{citizenData.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Civil Status</label>
                  <p className="text-sm">{citizenData.civil_status || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Digital Citizen ID - Right Side */}
        <Card className="glass-card h-fit">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-heading">Digital Citizen ID</CardTitle>
            {userName && <p className="text-xs text-muted-foreground">{userName}</p>}
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <QRCodeSVG id="citizen-qr-svg" value={qrData} size={180} level="H" />
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
