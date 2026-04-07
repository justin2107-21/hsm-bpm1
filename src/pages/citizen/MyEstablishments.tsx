import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Building2, AlertCircle, Calendar, Edit2, Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BUSINESS_TYPES = [
  "Food Service",
  "Retail Shop",
  "Restaurant",
  "Cafe/Coffee Shop",
  "Bakery",
  "Market/Wet Market",
  "Pharmacy",
  "Barbershop/Salon",
  "Clinic",
  "Hotel/Lodging",
  "Manufacturing/Factory",
  "Agricultural/Farm",
  "Entertainment",
  "Other",
];

const MyEstablishments = () => {
  const { user, userName, refreshEstablishments } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    address: "",
    barangay: "",
    contact_number: "",
    business_permit_number: "",
    issuing_lgu: "",
    permit_expiry_date: "",
  });
  const [editForm, setEditForm] = useState({
    business_name: "",
    business_type: "",
    address: "",
    barangay: "",
    contact_number: "",
    business_permit_number: "",
    issuing_lgu: "",
    permit_expiry_date: "",
  });

  const { data: establishments = [] } = useQuery({
    queryKey: ["citizen_establishments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("establishments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!form.business_name.trim()) {
      errors.business_name = "Business name is required";
    }
    if (!form.business_type.trim()) {
      errors.business_type = "Business type is required";
    }
    if (!form.address.trim()) {
      errors.address = "Address is required";
    }
    if (!form.barangay.trim()) {
      errors.barangay = "Barangay is required";
    }
    if (form.business_permit_number && !/^\d+$/.test(form.business_permit_number)) {
      errors.business_permit_number = "Permit number must contain only numbers";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error("Please fix validation errors");
      }
      const { error } = await supabase.from("establishments").insert({
        user_id: user!.id,
        owner_name: userName || "Owner",
        business_name: form.business_name,
        business_type: form.business_type,
        address: form.address,
        barangay: form.barangay,
        contact_number: form.contact_number,
        business_permit_number: form.business_permit_number,
        issuing_lgu: form.issuing_lgu,
        permit_expiry_date: form.permit_expiry_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_establishments"] });
      refreshEstablishments();
      setOpen(false);
      setValidationErrors({});
      setForm({ business_name: "", business_type: "", address: "", barangay: "", contact_number: "", business_permit_number: "", issuing_lgu: "", permit_expiry_date: "" });
      toast.success("Establishment registration submitted for verification");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEstablishment) throw new Error("No establishment selected");
      const { error } = await supabase
        .from("establishments")
        .update({
          business_name: editForm.business_name,
          business_type: editForm.business_type,
          address: editForm.address,
          barangay: editForm.barangay,
          contact_number: editForm.contact_number,
          business_permit_number: editForm.business_permit_number,
          issuing_lgu: editForm.issuing_lgu,
          permit_expiry_date: editForm.permit_expiry_date || null,
        })
        .eq("id", selectedEstablishment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_establishments"] });
      setEditOpen(false);
      setIsEditing(false);
      setSelectedEstablishment(null);
      setDetailsOpen(false);
      toast.success("Establishment updated successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEstablishment || uploadFiles.length === 0) throw new Error("No files to upload");
      
      const uploadedFiles = [];
      for (const file of uploadFiles) {
        const fileName = `${selectedEstablishment.id }/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("establishment_documents")
          .upload(fileName, file);
        if (error) throw error;
        uploadedFiles.push(file.name);
      }
      
      // Update establishment with file references
      const { data: currentData } = await supabase
        .from("establishments")
        .select("uploaded_documents")
        .eq("id", selectedEstablishment.id)
        .single();
      
      const existingDocs = currentData?.uploaded_documents || [];
      const { error: updateError } = await supabase
        .from("establishments")
        .update({ uploaded_documents: [...existingDocs, ...uploadedFiles] })
        .eq("id", selectedEstablishment.id);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_establishments"] });
      setUploadFiles([]);
      setSelectedEstablishment(null);
      toast.success("Documents uploaded successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to upload documents"),
  });

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending_verification: "Pending Verification",
      registered: "Registered",
      requires_correction: "Requires Correction",
      rejected: "Rejected",
    };
    return map[s] || s;
  };

  const openDetails = (establishment: any) => {
    setSelectedEstablishment(establishment);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Establishments</h1>
          <p className="text-sm text-muted-foreground">Register and manage your business establishments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Register Establishment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">Register New Establishment</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label className="text-xs">Business Name * {validationErrors.business_name && <span className="text-destructive text-xs">({validationErrors.business_name})</span>}</Label>
                <Input 
                  value={form.business_name} 
                  onChange={e => {
                    setForm({ ...form, business_name: e.target.value });
                    if (validationErrors.business_name) setValidationErrors({ ...validationErrors, business_name: "" });
                  }}
                  className={validationErrors.business_name ? "border-destructive" : ""}
                />
              </div>
              <div>
                <Label className="text-xs">Business Type * {validationErrors.business_type && <span className="text-destructive text-xs">({validationErrors.business_type})</span>}</Label>
                <Select value={form.business_type} onValueChange={(value) => {
                  setForm({ ...form, business_type: value });
                  if (validationErrors.business_type) setValidationErrors({ ...validationErrors, business_type: "" });
                }}>
                  <SelectTrigger className={validationErrors.business_type ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Address * {validationErrors.address && <span className="text-destructive text-xs">({validationErrors.address})</span>}</Label>
                <Input 
                  value={form.address} 
                  onChange={e => {
                    setForm({ ...form, address: e.target.value });
                    if (validationErrors.address) setValidationErrors({ ...validationErrors, address: "" });
                  }}
                  className={validationErrors.address ? "border-destructive" : ""}
                />
              </div>
              <div>
                <Label className="text-xs">Barangay * {validationErrors.barangay && <span className="text-destructive text-xs">({validationErrors.barangay})</span>}</Label>
                <Input 
                  value={form.barangay} 
                  onChange={e => {
                    setForm({ ...form, barangay: e.target.value });
                    if (validationErrors.barangay) setValidationErrors({ ...validationErrors, barangay: "" });
                  }}
                  className={validationErrors.barangay ? "border-destructive" : ""}
                />
              </div>
              <div><Label className="text-xs">Owner Name</Label><Input value={userName} disabled className="bg-muted" /></div>
              <div><Label className="text-xs">Contact Number</Label><Input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} /></div>
              <div>
                <Label className="text-xs">Business Permit Number {validationErrors.business_permit_number && <span className="text-destructive text-xs">({validationErrors.business_permit_number})</span>}</Label>
                <Input 
                  value={form.business_permit_number} 
                  onChange={e => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    setForm({ ...form, business_permit_number: value });
                    if (validationErrors.business_permit_number) setValidationErrors({ ...validationErrors, business_permit_number: "" });
                  }}
                  placeholder="Numeric characters only"
                  className={validationErrors.business_permit_number ? "border-destructive" : ""}
                />
              </div>
              <div><Label className="text-xs">Issuing LGU</Label><Input value={form.issuing_lgu} onChange={e => setForm({ ...form, issuing_lgu: e.target.value })} /></div>
              <div>
                <Label className="text-xs">Business Permit Expiry Date</Label>
                <div className="relative">
                  <Input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={form.permit_expiry_date} 
                    onChange={e => setForm({ ...form, permit_expiry_date: e.target.value })}
                    className="pr-10"
                    style={{
                      colorScheme: 'light dark',
                    }}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black dark:text-white pointer-events-none" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">After submission, Sanitation Office Staff will verify your registration before approval.</p>
              <Button className="w-full" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                {addMutation.isPending ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-sm font-heading">Registered Establishments</CardTitle></CardHeader>
        <CardContent>
          {establishments.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No establishments registered yet.</p>
              <p className="text-xs text-muted-foreground">Click "Register Establishment" to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Business Name</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Address</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Permit #</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {establishments.map(e => (
                    <TableRow 
                      key={e.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setSelectedEstablishment(e);
                        setEditForm(e);
                        setDetailsOpen(true);
                      }}
                    >
                      <TableCell className="font-medium text-sm">{e.business_name}</TableCell>
                      <TableCell className="text-sm">{e.business_type}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{e.address}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{e.business_permit_number}</TableCell>
                      <TableCell><StatusBadge status={statusLabel(e.status)} /></TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() => {
                            setSelectedEstablishment(e);
                            setEditForm(e);
                            setEditOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {establishments.some(e => e.status === "requires_correction" && e.reviewer_notes) && (
            <div className="mt-4 space-y-2">
              {establishments.filter(e => e.reviewer_notes).map(e => (
                <div key={e.id} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-xs font-medium text-destructive">{e.business_name} — Correction Required:</p>
                  <p className="text-xs text-muted-foreground mt-1">{e.reviewer_notes}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-base">Establishment Details</DialogTitle>
          </DialogHeader>
          {selectedEstablishment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Reference ID</p>
                  <p className="font-mono text-sm text-muted-foreground">{selectedEstablishment.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business Name</p>
                  <p className="font-medium text-sm">{selectedEstablishment.business_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business Type</p>
                  <p className="text-sm">{selectedEstablishment.business_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{selectedEstablishment.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Barangay</p>
                  <p className="text-sm">{selectedEstablishment.barangay}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Owner Name</p>
                  <p className="text-sm">{selectedEstablishment.owner_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact Number</p>
                  <p className="text-sm">{selectedEstablishment.contact_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business Permit Number</p>
                  <p className="text-sm">{selectedEstablishment.business_permit_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Issuing LGU</p>
                  <p className="text-sm">{selectedEstablishment.issuing_lgu}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Permit Expiry Date</p>
                  <p className="text-sm">{selectedEstablishment.permit_expiry_date || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1"><StatusBadge status={statusLabel(selectedEstablishment.status)} /></div>
                </div>
              </div>
              
              {/* Uploaded Documents Section */}
              {selectedEstablishment.uploaded_documents && selectedEstablishment.uploaded_documents.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-semibold mb-2">Uploaded Documents:</p>
                  <div className="space-y-1">
                    {selectedEstablishment.uploaded_documents.map((doc: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEstablishment.status === "requires_correction" && selectedEstablishment.reviewer_notes && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-destructive mb-1">Correction Required:</p>
                    <p className="text-xs text-muted-foreground">{selectedEstablishment.reviewer_notes}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t flex gap-2">
                <Button 
                  onClick={() => setDetailsOpen(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Close
                </Button>
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-heading">Edit Establishment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <div>
                        <Label className="text-xs">Business Name</Label>
                        <Input 
                          value={editForm.business_name} 
                          onChange={e => setEditForm({ ...editForm, business_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Business Type</Label>
                        <Select value={editForm.business_type} onValueChange={(value) => setEditForm({ ...editForm, business_type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Address</Label>
                        <Input 
                          value={editForm.address} 
                          onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Barangay</Label>
                        <Input 
                          value={editForm.barangay} 
                          onChange={e => setEditForm({ ...editForm, barangay: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Contact Number</Label>
                        <Input value={editForm.contact_number} onChange={e => setEditForm({ ...editForm, contact_number: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Business Permit Number</Label>
                        <Input 
                          value={editForm.business_permit_number} 
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, '');
                            setEditForm({ ...editForm, business_permit_number: value });
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Issuing LGU</Label>
                        <Input value={editForm.issuing_lgu} onChange={e => setEditForm({ ...editForm, issuing_lgu: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Business Permit Expiry Date</Label>
                        <Input 
                          type="date" 
                          value={editForm.permit_expiry_date} 
                          onChange={e => setEditForm({ ...editForm, permit_expiry_date: e.target.value })}
                        />
                      </div>
                      
                      {/* File Upload Section */}
                      <div className="pt-3 border-t">
                        <Label className="text-xs mb-2 block">Upload Additional Documents or Correction Notice</Label>
                        <Input 
                          type="file" 
                          multiple 
                          onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                          className="text-xs"
                        />
                        {uploadFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {uploadFiles.map((f, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                {f.name}
                              </div>
                            ))}
                          </div>
                        )}
                        <Button 
                          onClick={() => uploadMutation.mutate()}
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full gap-1"
                          disabled={uploadMutation.isPending || uploadFiles.length === 0}
                        >
                          <Upload className="h-4 w-4" />
                          {uploadMutation.isPending ? "Uploading..." : "Upload Documents"}
                        </Button>
                      </div>
                      
                      <Button className="w-full" onClick={() => editMutation.mutate()} disabled={editMutation.isPending}>
                        {editMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyEstablishments;
