import { useEffect, useRef, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import "leaflet.heat";
import * as turf from "@turf/turf";
import { Map as MapIcon, Filter, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DISEASE_COLORS: Record<string, string> = {
  Dengue: "#ef4444",
  Tuberculosis: "#f59e0b",
  Measles: "#ec4899",
  Leptospirosis: "#22c55e",
  Rabies: "#3b82f6",
  "Foodborne Illness": "#a855f7",
  "Influenza-Like Illness": "#0ea5e9",
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

// Approximate Quezon City boundary polygon (lon, lat) for masking
const QC_BOUNDARY_COORDS: [number, number][] = [
  [121.0205, 14.7625],
  [121.104, 14.754],
  [121.143, 14.720],
  [121.150, 14.690],
  [121.142, 14.655],
  [121.123, 14.628],
  [121.095, 14.605],
  [121.060, 14.590],
  [121.020, 14.585],
  [120.990, 14.600],
  [120.970, 14.640],
  [120.965, 14.680],
  [120.975, 14.715],
  [121.000, 14.745],
  [121.0205, 14.7625],
];

interface DiseaseCase {
  id: string;
  disease: string;
  status: string;
  case_date: string;
  patient_location: string | null;
  case_count: number;
}

type HotspotKey = string; // `${barangay}__${disease}`

interface HotspotSummary {
  barangay: string;
  disease: string;
  casesInWindow: number;
}

const DiseaseMapDashboard = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);

  const [activeDiseases, setActiveDiseases] = useState<string[]>([]);

  const [filterBarangay, setFilterBarangay] = useState("");
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
    refetchInterval: 15000,
  });

  const diseases = useMemo(
    () => [...new Set(cases.map((c) => c.disease))].filter(Boolean),
    [cases],
  );
  const barangays = useMemo(
    () => [...new Set(cases.map((c) => c.patient_location).filter(Boolean))],
    [cases],
  );
  const statuses = useMemo(() => [...new Set(cases.map((c) => c.status))], [cases]);

  // Initialize active diseases on first load
  useEffect(() => {
    if (activeDiseases.length === 0 && diseases.length > 0) {
      setActiveDiseases(diseases);
    }
  }, [diseases, activeDiseases.length]);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (filterBarangay && c.patient_location !== filterBarangay) return false;
      if (activeDiseases.length > 0 && !activeDiseases.includes(c.disease)) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (dateFrom && c.case_date < dateFrom) return false;
      if (dateTo && c.case_date > dateTo) return false;
      return true;
    });
  }, [cases, filterBarangay, activeDiseases, filterStatus, dateFrom, dateTo]);

  // Summary stats and hotspot detection (7-day window)
  const {
    totalCases,
    casesThisWeek,
    activeCases,
    hotspotSummaries,
    hotspotBarangays,
  }: {
    totalCases: number;
    casesThisWeek: number;
    activeCases: number;
    hotspotSummaries: HotspotSummary[];
    hotspotBarangays: number;
  } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    let total = cases.reduce((sum, c) => sum + (c.case_count || 0), 0);
    let weekCount = 0;
    let activeCount = 0;
    let hotspotBarangays = 0;

    const bucket = new globalThis.Map<HotspotKey, number>();

    for (const c of cases) {
      const reported = new Date(c.case_date);
      if (!isNaN(reported.getTime()) && reported >= weekAgo && reported <= now) {
        weekCount += c.case_count || 0;
        if (c.patient_location) {
          const key: HotspotKey = `${c.patient_location}__${c.disease}`;
          bucket.set(key, (bucket.get(key) || 0) + (c.case_count || 0));
        }
      }

      if (!["Resolved", "Completed", "Certificate Issued", "Approved"].includes(c.status)) {
        activeCount++;
      }
    }

    const hotspots: HotspotSummary[] = [];
    bucket.forEach((count, key) => {
      if (count > 0) {
        const [barangay, disease] = key.split("__");
        hotspots.push({ barangay, disease, casesInWindow: count });
        if (count >= 5) hotspotBarangays++;
      }
    });

    return {
      totalCases: total,
      casesThisWeek: weekCount,
      activeCases: activeCount,
        hotspotSummaries: hotspots,
        hotspotBarangays,
    };
  }, [cases]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      minZoom: 11,
      maxZoom: 18,
    }).setView([14.676, 121.0437], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Build world mask minus Quezon City polygon
    const world = turf.polygon([
      [
        [-180, -90],
        [180, -90],
        [180, 90],
        [-180, 90],
        [-180, -90],
      ],
    ]);
    const qcPoly = turf.polygon([QC_BOUNDARY_COORDS]);
    let maskGeom: unknown = null;
    try {
      // @turf/turf v7+ expects a FeatureCollection for difference()
      maskGeom = (turf as any).difference(turf.featureCollection([world, qcPoly]));
    } catch {
      // If masking fails (invalid polygon, turf version mismatch, etc.), don't crash the page.
      maskGeom = null;
    }

    if (maskGeom) {
      L.geoJSON(maskGeom as any, {
        style: {
          color: "transparent",
          fillColor: "#020617",
          fillOpacity: 0.55,
        },
        interactive: false,
      }).addTo(map);
    }

    // Draw Quezon City boundary outline
    L.geoJSON(qcPoly as any, {
      style: {
        color: "#22c55e",
        weight: 2,
        fillOpacity: 0,
      },
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers and heatmap layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous marker cluster
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }
    // Remove previous heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    const cluster = (L as any).markerClusterGroup();
    clusterRef.current = cluster;

    const heatPoints: [number, number, number][] = [];

    filtered.forEach((c) => {
      const loc = c.patient_location || "";
      const coords = loc ? BARANGAY_COORDS[loc] : undefined;
      if (!coords) return;

      let lat = coords[0];
      let lng = coords[1];

      // Collect points for heatmap (weight by case_count)
      const weight = Math.max(1, c.case_count || 1);
      heatPoints.push([lat, lng, weight]);

      const marker = L.marker([lat, lng], { icon: createIcon(getColor(c.disease)) });
      marker.bindPopup(
        `<div style="font-size:13px;line-height:1.5">
          <strong>${c.disease}</strong><br/>
          <b>Barangay:</b> ${loc || "Unknown"}<br/>
          <b>Status:</b> ${c.status}<br/>
          <b>Date:</b> ${c.case_date}<br/>
          <b>Cases:</b> ${c.case_count}
        </div>`,
      );
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);

    if (heatPoints.length > 0) {
      const heat = (L as any).heatLayer(heatPoints, {
        radius: 25,
        blur: 18,
        maxZoom: 17,
        // Colors approximate: green (low) -> yellow -> orange -> red (high)
        gradient: {
          0.1: "#22c55e",
          0.4: "#eab308",
          0.7: "#f97316",
          1.0: "#ef4444",
        },
      });
      heat.addTo(map);
      heatLayerRef.current = heat;
    }
  }, [filtered]);

  const clearFilters = () => {
    setFilterBarangay("");
    setActiveDiseases(diseases);
    setFilterStatus("");
    setDateFrom("");
    setDateTo("");
  };

  const toggleDisease = (disease: string) => {
    setActiveDiseases((prev) =>
      prev.includes(disease) ? prev.filter((d) => d !== disease) : [...prev, disease],
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <MapIcon className="h-6 w-6 text-primary" /> Disease Surveillance Mapping
          </h1>
          {hotspotSummaries.length > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-50 px-3 py-1 text-xs text-amber-900 dark:bg-amber-500/15 dark:text-amber-50 dark:border-amber-400/60">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold tracking-wide">HOTSPOT ALERT</span>
              <span>· {hotspotSummaries.length} active hotspot barangay/disease clusters</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time disease case mapping focused on Quezon City with barangay-level hotspot detection.
        </p>
      </div>

      {/* Map full-width */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full h-[520px] rounded-lg" />
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="glass-card border border-primary/10">
          <CardContent className="py-3 px-3">
            <p className="text-[11px] text-muted-foreground mb-1">Total Disease Cases</p>
            <p className="text-xl font-semibold font-heading">{totalCases}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border border-sky-400/20">
          <CardContent className="py-3 px-3">
            <p className="text-[11px] text-muted-foreground mb-1">Cases This Week</p>
            <p className="text-xl font-semibold font-heading text-sky-600 dark:text-sky-300">
              {casesThisWeek}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border border-emerald-400/20">
          <CardContent className="py-3 px-3">
            <p className="text-[11px] text-muted-foreground mb-1">Active Cases</p>
            <p className="text-xl font-semibold font-heading text-emerald-600 dark:text-emerald-300">
              {activeCases}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border border-rose-400/20">
          <CardContent className="py-3 px-3">
            <p className="text-[11px] text-muted-foreground mb-1">Hotspot Barangays</p>
            <p className="text-xl font-semibold font-heading text-rose-600 dark:text-rose-300">
              {hotspotBarangays}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + case list below map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
              <Label className="text-xs">Status</Label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
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
              <p className="text-[11px] font-semibold text-muted-foreground mb-2">Disease Legend</p>
              <div className="flex flex-wrap gap-1.5">
                {diseases
                  .filter((d) => d && d !== "COVID-19")
                  .map((disease) => {
                    const color = getColor(disease);
                    const isActive = activeDiseases.includes(disease);
                    return (
                      <button
                        key={disease}
                        type="button"
                        onClick={() => toggleDisease(disease)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                          isActive
                            ? "bg-background text-foreground border-border"
                            : "bg-muted/60 text-muted-foreground border-transparent opacity-70",
                        )}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ background: color }}
                        />
                        <span className="truncate max-w-[96px]">{disease}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case list */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading">Cases on Map ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No cases match current filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded-lg border border-border bg-muted/20 flex items-center gap-3"
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: getColor(c.disease) }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{c.disease}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {c.patient_location || "Unknown"} · {c.case_date} · {c.status}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {c.case_count} case{c.case_count === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hotspot detection table */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" /> Hotspot & Cluster Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hotspotSummaries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No barangays currently have reported clusters in the last 7 days.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <span className="font-semibold uppercase tracking-wide">Hotspot Legend</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Hotspot (5+ cases / 7 days)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Moderate (3–4 cases / 7 days)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Resolved / Low (1–2 cases / 7 days)
                </span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Barangay</TableHead>
                      <TableHead className="text-xs">Disease</TableHead>
                      <TableHead className="text-xs">Cases in last 7 days</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotspotSummaries
                      .sort((a, b) => b.casesInWindow - a.casesInWindow)
                      .map((h) => {
                        let label = "Resolved";
                        let className = "text-green-600 dark:text-green-300";
                        let dotClass = "bg-green-500";
                        if (h.casesInWindow >= 5) {
                          label = "Hotspot";
                          className = "text-red-600 dark:text-red-400";
                          dotClass = "bg-red-500";
                        } else if (h.casesInWindow >= 3) {
                          label = "Moderate";
                          className = "text-yellow-600 dark:text-yellow-300";
                          dotClass = "bg-yellow-400";
                        }
                        return (
                          <TableRow
                            key={`${h.barangay}-${h.disease}`}
                            className="cursor-pointer hover:bg-muted/60"
                            onClick={() => {
                              const map = mapInstanceRef.current;
                              const coords = BARANGAY_COORDS[h.barangay];
                              if (map && coords) {
                                map.setView([coords[0], coords[1]], 14);
                              }
                            }}
                          >
                            <TableCell className="text-sm">{h.barangay}</TableCell>
                            <TableCell className="text-sm">{h.disease}</TableCell>
                            <TableCell className="text-sm">{h.casesInWindow}</TableCell>
                            <TableCell className={cn("text-xs font-semibold flex items-center gap-1", className)}>
                              <span className={cn("w-2.5 h-2.5 rounded-full", dotClass)} />
                              {label}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiseaseMapDashboard;
