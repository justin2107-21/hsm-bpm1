import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, AlertCircle } from "lucide-react";
import { useState } from "react";

const ServiceRequests = () => {
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["citizen_service_requests", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('❌ No user ID');
        return [];
      }
      
      console.log('🔍 Fetching combined service requests for user:', user.id);
      
      try {
        // Fetch service requests
        const { data: serviceRequests, error: srError } = await supabase
          .from("service_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (srError) throw srError;
        
        // Fetch vaccinations
        const { data: vaccinations, error: vacError } = await (supabase as any)
          .from("vaccinations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (vacError) throw vacError;
        
        // Fetch establishments
        const { data: establishments, error: estError } = await supabase
          .from("establishments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (estError) throw estError;

        // Normalize vaccinations to match request format
        const normalizedVaccinations = (vaccinations || []).map(vac => ({
          id: vac.id,
          created_at: vac.created_at,
          request_type: "Vaccination Appointment",
          title: `Vaccination — ${vac.vaccine}`,
          description: `Patient: ${vac.patient_name || 'N/A'}; Health Center: ${vac.health_center || 'Any'}${vac.notes ? `; Notes: ${vac.notes}` : ''}`,
          status: vac.status,
          type: 'vaccination',
          original: vac,
        }));

        // Normalize establishments to match request format
        const normalizedEstablishments = (establishments || []).map(est => ({
          id: est.id,
          created_at: est.created_at,
          request_type: "Establishment Registration",
          title: `${est.business_name} — ${est.business_type}`,
          description: `Address: ${est.address || 'N/A'}; Permit No: ${est.business_permit_number || 'Pending'}`,
          status: est.status,
          type: 'establishment',
          original: est,
        }));

        // Combine all requests (service requests already include vaccination appointments)
        const allRequests = [
          ...(serviceRequests || []).map(sr => ({ ...sr, type: 'service' })),
          ...normalizedVaccinations,
          ...normalizedEstablishments,
        ];

        // Sort by created_at descending
        allRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        console.log('✅ Combined requests:', allRequests.length, 'total');
        return allRequests;
      } catch (error) {
        console.error('❌ Error:', error);
        throw error;
      }
    },
    enabled: !!user,
  });

  const openDetails = (request: any) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const cleanDescription = (description: string) => {
    if (!description) return "—";
    // Remove "Citizen requested" prefix if present
    return description.replace(/^Citizen requested\s*-?\s*/i, "").trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Service Requests</h1>
          <p className="text-sm text-muted-foreground">Track all your service requests across modules</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm font-heading">All Requests</CardTitle></CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No service requests found.</p>
              <p className="text-xs text-muted-foreground mt-1">Requests from health, vaccination, permits, and complaints will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Description</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(r => (
                    <TableRow 
                      key={r.id}
                      onClick={() => openDetails(r)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{r.request_type}</TableCell>
                      <TableCell className="font-medium text-sm">{r.title}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell text-muted-foreground line-clamp-1">{cleanDescription(r.description)}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-base">Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Date Submitted</p>
                  <p className="text-sm font-medium">{new Date(selectedRequest.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Request Type</p>
                  <p className="text-sm font-medium">{selectedRequest.request_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Title</p>
                  <p className="text-sm font-medium">{selectedRequest.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="mt-1"><StatusBadge status={selectedRequest.status} /></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap break-words">{cleanDescription(selectedRequest.description) || "No additional details"}</p>
                </div>
                {selectedRequest.type === 'vaccination' && selectedRequest.original && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reference ID</p>
                      <p className="text-sm font-mono text-xs text-muted-foreground">{selectedRequest.original.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Vaccine</p>
                      <p className="text-sm font-medium">{selectedRequest.original.vaccine}</p>
                    </div>
                    {selectedRequest.original.patient_name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Patient Name</p>
                        <p className="text-sm font-medium">{selectedRequest.original.patient_name}</p>
                      </div>
                    )}
                    {selectedRequest.original.vaccination_date && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Scheduled Date</p>
                        <p className="text-sm font-medium">{selectedRequest.original.vaccination_date}</p>
                      </div>
                    )}
                  </>
                )}
                {selectedRequest.type === 'establishment' && selectedRequest.original && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reference ID</p>
                      <p className="text-sm font-mono text-xs text-muted-foreground">{selectedRequest.original.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Business Type</p>
                      <p className="text-sm font-medium">{selectedRequest.original.business_type}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Status Information</p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">You will receive updates on the status of this request through your registered contact information.</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRequests;
