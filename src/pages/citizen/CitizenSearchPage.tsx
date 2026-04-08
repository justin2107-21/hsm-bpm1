import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, X, Heart, FileText, Shield, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Citizen {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  barangay: string | null;
  birth_date: string | null;
  gender: string | null;
}

export default function CitizenSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch health records for selected citizen
  const { data: healthRecords = [] } = useQuery({
    queryKey: ["citizen_health", selectedCitizen?.id],
    queryFn: async () => {
      if (!selectedCitizen?.id) return [];
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*")
        .eq("user_id", selectedCitizen.id)
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCitizen?.id,
  });

  // Fetch service requests for selected citizen
  const { data: serviceRequests = [] } = useQuery({
    queryKey: ["citizen_requests", selectedCitizen?.id],
    queryFn: async () => {
      if (!selectedCitizen?.id) return [];
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("user_id", selectedCitizen.id)
        .limit(10)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCitizen?.id,
  });

  // Fetch disease surveillance cases for selected citizen
  const { data: surveillanceCases = [] } = useQuery({
    queryKey: ["citizen_surveillance", selectedCitizen?.id],
    queryFn: async () => {
      if (!selectedCitizen?.id) return [];
      try {
        const { data, error } = await supabase
          .from("surveillance_cases")
          .select("*")
          .limit(10)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch {
        return [];
      }
    },
    enabled: !!selectedCitizen?.id,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/.netlify/functions/citizens-search?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to search citizens");
      }

      const data = await response.json();
      setResults(data);
      
      if (data.length === 0) {
        toast.info("No citizens found");
      } else {
        toast.success(`Found ${data.length} citizen(s)`);
      }
    } catch (error) {
      toast.error("Error searching citizens");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (citizenId: string, citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setActiveTab("profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Citizen Search</h1>
          <p className="text-muted-foreground">Search and view citizen health profiles and service history</p>
        </div>

        {/* Search Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Citizens by Name or Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label>Search by name or email</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Juan Dela Cruz or juan@example.com"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-1">
            {results.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold mb-3">Results ({results.length})</h2>
                <div className="space-y-2">
                  {results.map((citizen) => (
                    <Card
                      key={citizen.id}
                      className={`cursor-pointer transition-all ${
                        selectedCitizen?.id === citizen.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/40"
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm">
                            {citizen.first_name} {citizen.last_name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {citizen.email || "No email"}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => handleViewDetails(citizen.id, citizen)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No results found" : "Search to begin"}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedCitizen && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg">
                    {selectedCitizen.first_name} {selectedCitizen.last_name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCitizen(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>

                {/* Tabs */}
                <div className="border-b">
                  <div className="flex gap-2 px-6 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === "profile"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Stethoscope className="h-4 w-4" />
                        Profile
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("health")}
                      className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === "health"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        Health ({healthRecords.length})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("requests")}
                      className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === "requests"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Requests ({serviceRequests.length})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("surveillance")}
                      className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === "surveillance"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Cases ({surveillanceCases.length})
                      </div>
                    </button>
                  </div>
                </div>

                <CardContent className="pt-6 space-y-4">
                  {/* Profile Tab */}
                  {activeTab === "profile" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedCitizen.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedCitizen.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="font-medium">{selectedCitizen.address || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Barangay</p>
                        <p className="font-medium">{selectedCitizen.barangay || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Birth Date</p>
                        <p className="font-medium">
                          {selectedCitizen.birth_date
                            ? new Date(selectedCitizen.birth_date).toLocaleDateString()
                            : "—"
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="font-medium">{selectedCitizen.gender || "—"}</p>
                      </div>
                    </div>
                  )}

                  {/* Health Records Tab */}
                  {activeTab === "health" && (
                    <div className="space-y-2">
                      {healthRecords.length > 0 ? (
                        healthRecords.map((record: any) => (
                          <div key={record.id} className="border rounded-lg p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{record.vaccine_type || "Vaccination"}</span>
                              <Badge variant="outline">
                                {new Date(record.created_at).toLocaleDateString()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {record.notes || "No additional notes"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No vaccination records found</p>
                      )}
                    </div>
                  )}

                  {/* Service Requests Tab */}
                  {activeTab === "requests" && (
                    <div className="space-y-2">
                      {serviceRequests.length > 0 ? (
                        serviceRequests.map((request: any) => (
                          <div key={request.id} className="border rounded-lg p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{request.title}</span>
                              <Badge variant={request.status === "approved" ? "default" : "secondary"}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {request.request_type}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No service requests found</p>
                      )}
                    </div>
                  )}

                  {/* Surveillance Cases Tab */}
                  {activeTab === "surveillance" && (
                    <div className="space-y-2">
                      {surveillanceCases.length > 0 ? (
                        surveillanceCases.map((caseRecord: any) => (
                          <div key={caseRecord.id} className="border rounded-lg p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{caseRecord.disease}</span>
                              <Badge variant={caseRecord.status === "active" ? "destructive" : "outline"}>
                                {caseRecord.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(caseRecord.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No surveillance cases found</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
