
-- Rename Resident_User to Citizen_User in the enum
ALTER TYPE public.app_role RENAME VALUE 'Resident_User' TO 'Citizen_User';

-- Create establishments table for business registration with verification
CREATE TABLE public.establishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_name text NOT NULL,
  business_type text,
  address text,
  barangay text,
  owner_name text NOT NULL,
  contact_number text,
  business_permit_number text,
  issuing_lgu text,
  permit_expiry_date date,
  permit_document_url text,
  status text NOT NULL DEFAULT 'pending_verification',
  reviewer_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- Owners can read their own; staff/inspectors can read all
CREATE POLICY "Establishments read" ON public.establishments
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'Clerk_User')
  OR public.has_role(auth.uid(), 'BSI_User')
  OR public.has_role(auth.uid(), 'Captain_User')
  OR public.has_role(auth.uid(), 'SysAdmin_User')
);

-- Owners can insert their own
CREATE POLICY "Establishments insert" ON public.establishments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Owners can update their own pending ones; staff can update any
CREATE POLICY "Establishments update" ON public.establishments
FOR UPDATE TO authenticated
USING (
  (auth.uid() = user_id AND status IN ('pending_verification', 'requires_correction'))
  OR public.has_role(auth.uid(), 'Clerk_User')
  OR public.has_role(auth.uid(), 'BSI_User')
);

-- Create service_requests table for unified request tracking
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_type text NOT NULL,
  reference_id uuid,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own requests read" ON public.service_requests
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'Clerk_User') OR public.has_role(auth.uid(), 'Captain_User'));

CREATE POLICY "Own requests insert" ON public.service_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Requests update" ON public.service_requests
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'Clerk_User') OR public.has_role(auth.uid(), 'BSI_User') OR auth.uid() = user_id);

-- Create certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  certificate_type text NOT NULL DEFAULT 'sanitary_permit',
  certificate_number text,
  issued_date date,
  expiry_date date,
  status text NOT NULL DEFAULT 'pending',
  document_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Certificates read" ON public.certificates
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'Clerk_User') OR public.has_role(auth.uid(), 'BSI_User') OR public.has_role(auth.uid(), 'Captain_User'));

CREATE POLICY "Certificates insert" ON public.certificates
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'Clerk_User') OR public.has_role(auth.uid(), 'BSI_User'));

-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  establishment_id uuid REFERENCES public.establishments(id) ON DELETE SET NULL,
  payment_type text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  reference_number text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments read" ON public.payments
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'Clerk_User'));

CREATE POLICY "Payments insert" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'Clerk_User'));

-- Update the updated_at trigger for new tables
CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON public.establishments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rename resident tables columns/references in RLS to be consistent
-- Update resident_complaints policies to also allow Clerk reading
CREATE POLICY "Clerk read complaints" ON public.resident_complaints
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'Clerk_User') OR public.has_role(auth.uid(), 'BSI_User'));

-- Update resident_health_records policies for clerk access
CREATE POLICY "Staff read health records" ON public.resident_health_records
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'Clerk_User') OR public.has_role(auth.uid(), 'BHW_User'));

-- Create storage bucket for business permits
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users upload own docs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own docs" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Staff read all docs" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND (public.has_role(auth.uid(), 'Clerk_User') OR public.has_role(auth.uid(), 'BSI_User')));
