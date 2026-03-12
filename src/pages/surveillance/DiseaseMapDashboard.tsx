import { useEffect, useRef, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Map, Filter } from "lucide-react";

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DISEASE_COLORS: Record<string, string> = {
  Dengue: "#ef4444",
  "COVID-19": "#3b82f6",
  Tuberculosis: "#f59e0b",
  Influenza: "#8b5cf6",
  Measles: "#ec4899",
  Cholera: "#14b8a6",
};

const getColor = (disease: string) => DISEASE_COLORS[disease] || "#6b7280";

const createIcon = (color: string) =>
  L.divIcon({
    className: "custom-disease-marker",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

// Quezon City barangay coordinates for demo data mapping
const BARANGAY_COORDS: Record<string, [number, number]> = {
  "Commonwealth": [14.6994, 121.0867],
  "Batasan Hills": [14.6819, 121.0968],
  "Holy Spirit": [14.6809, 121.0804],
  "Payatas": [14.7095, 121.1022],
  "Bagong Silangan": [14.6887, 121.1109],
  "Fairview": [14.7131, 121.0690],
  "Novaliches": [14.7283, 121.0439],
  "Tandang Sora": [14.6849, 121.0436],
  "Diliman": [14.6538, 121.0586],
  "Cubao": [14.6180, 121.0579],
  "Kamuning": [14.6316, 121.0437],
  "Project 6": [14.6512, 121.0396],
};

interface DiseaseCase {
  id: string;
  disease: string;
  status: string;
  case_date: string;
  patient_location: string | null;
  case_count: number;
}

const DiseaseMapDashboard = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  const [filterBarangay, setFilterBarangay] = useState("");
  const [filterDisease, setFilterDisease] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: cases = [] } = useQuery({
    queryKey: ["disease_map_cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveillance_cases")
        .select("*")
        .order("case_date", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as DiseaseCase[];
    },
  });

  const diseases = useMemo(() => [...new Set(cases.map((c) => c.disease))], [cases]);
  const barangays = useMemo(
    () => [...new Set(cases.map((c) => c.patient_location).filter(Boolean))],
    [cases]
  );
  const statuses = useMemo(() => [...new Set(cases.map((c) => c.status))], [cases]);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (filterBarangay && c.patient_location !== filterBarangay) return false;
      if (filterDisease && c.disease !== filterDisease) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (dateFrom && c.case_date < dateFrom) return false;
      if (dateTo && c.case_date > dateTo) return false;
      return true;
    });
  }, [cases, filterBarangay, filterDisease, filterStatus, dateFrom, dateTo]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current).setView([14.676, 121.0437], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const cluster = (L as any).markerClusterGroup();
    clusterRef.current = cluster;

    filtered.forEach((c) => {
      const loc = c.patient_location || "";
      const coords = BARANGAY_COORDS[loc];
      if (!coords) return;
      // Add slight jitter to avoid overlapping markers
      const lat = coords[0] + (Math.random() - 0.5) * 0.005;
      const lng = coords[1] + (Math.random() - 0.5) * 0.005;

      const marker = L.marker([lat, lng], { icon: createIcon(getColor(c.disease)) });
      marker.bindPopup(
        `<div style="font-size:13px;line-height:1.5">
          <strong>${c.disease}</strong><br/>
          <b>Barangay:</b> ${loc || "Unknown"}<br/>
          <b>Status:</b> ${c.status}<br/>
          <b>Date:</b> ${c.case_date}<br/>
          <b>Cases:</b> ${c.case_count}
        </div>`
      );
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
  }, [filtered]);

  const clearFilters = () => {
    setFilterBarangay("");
    setFilterDisease("");
    setFilterStatus("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" /> Health Surveillance Map
        </h1>
        <p className="text-sm text-muted-foreground">
          Interactive disease case mapping for Quezon City — {filtered.length} cases displayed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Barangay</Label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={filterBarangay}
                onChange={(e) => setFilterBarangay(e.target.value)}
              >
                <option value="">All Barangays</option>
                {barangays.map((b) => (
                  <option key={b} value={b!}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Disease Type</Label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={filterDisease}
                onChange={(e) => setFilterDisease(e.target.value)}
              >
                <option value="">All Diseases</option>
                {diseases.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Date From</Label>
              <Input type="date" className="h-8 text-xs" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Date To</Label>
              <Input type="date" className="h-8 text-xs" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={clearFilters}>
              Clear Filters
            </Button>

            {/* Legend */}
            <div className="pt-2 border-t border-border">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2">Legend</p>
              <div className="space-y-1">
                {Object.entries(DISEASE_COLORS).map(([disease, color]) => (
                  <div key={disease} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: color }} />
                    <span className="text-[11px]">{disease}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-white shadow-sm bg-gray-500" />
                  <span className="text-[11px]">Other</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="glass-card">
            <CardContent className="p-0">
              <div ref={mapRef} className="w-full h-[500px] rounded-lg" />
            </CardContent>
          </Card>

          {/* Case list sidebar */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading">Cases on Map ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No cases match current filters.</p>
                ) : (
                  filtered.slice(0, 50).map((c) => (
                    <div key={c.id} className="p-2 rounded-lg border border-border bg-muted/20 flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: getColor(c.disease) }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{c.disease}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {c.patient_location || "Unknown"} · {c.case_date} · {c.status}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{c.case_count} case(s)</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiseaseMapDashboard;
