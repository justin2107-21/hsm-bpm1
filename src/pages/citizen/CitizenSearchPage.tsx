import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

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

  const handleViewDetails = async (citizenId: string) => {
    try {
      const response = await fetch(`/.netlify/functions/citizens-get?id=${citizenId}`);
      const data = await response.json();
      setSelectedCitizen(data);
    } catch (error) {
      toast.error("Failed to load citizen details");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search Citizens</h1>
          <p className="text-muted-foreground">Search the CIE citizen database (from classmate's Supabase)</p>
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
        <div className="grid gap-4">
          {results.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold">Results ({results.length})</h2>
              {results.map((citizen) => (
                <Card
                  key={citizen.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg">
                          {citizen.first_name} {citizen.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          📧 {citizen.email || "No email"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          📱 {citizen.phone || "No phone"}
                        </p>
                        {citizen.barangay && (
                          <p className="text-sm text-muted-foreground">
                            📍 {citizen.barangay}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(citizen.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "No results found" : "Search to begin"}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedCitizen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full max-h-[90vh] overflow-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
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
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
