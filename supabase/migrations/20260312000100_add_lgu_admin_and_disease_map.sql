-- Add LGU Admin role (read-only municipal monitoring)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'LGUAdmin_User';

-- Allow staff workflows to update operational tables
DO $$
BEGIN
  -- service_requests: allow Captain to update (review/schedule/complete)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_requests' AND policyname='Requests update (Captain)'
  ) THEN
    CREATE POLICY "Requests update (Captain)" ON public.service_requests
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'Captain_User'));
  END IF;
END $$;

-- sanitation_permits: allow staff to update statuses (verification, inspection outcomes, approval)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sanitation_permits' AND policyname='Staff update permits'
  ) THEN
    CREATE POLICY "Staff update permits" ON public.sanitation_permits
    FOR UPDATE TO authenticated
    USING (
      public.has_role(auth.uid(), 'Clerk_User')
      OR public.has_role(auth.uid(), 'BSI_User')
      OR public.has_role(auth.uid(), 'Captain_User')
      OR public.has_role(auth.uid(), 'SysAdmin_User')
    );
  END IF;
END $$;

-- inspections: allow inspectors and staff to update findings/status fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='inspections' AND policyname='Staff update inspections'
  ) THEN
    CREATE POLICY "Staff update inspections" ON public.inspections
    FOR UPDATE TO authenticated
    USING (
      public.has_role(auth.uid(), 'BSI_User')
      OR public.has_role(auth.uid(), 'Clerk_User')
      OR public.has_role(auth.uid(), 'Captain_User')
      OR public.has_role(auth.uid(), 'SysAdmin_User')
    );
  END IF;
END $$;

-- resident_health_records: allow Clerk to insert assessments/records for any citizen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resident_health_records' AND policyname='Clerk insert health records'
  ) THEN
    CREATE POLICY "Clerk insert health records" ON public.resident_health_records
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'Clerk_User'));
  END IF;
END $$;

-- certificates: allow Captain to insert when approving permits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='certificates' AND policyname='Certificates insert (Captain)'
  ) THEN
    CREATE POLICY "Certificates insert (Captain)" ON public.certificates
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'Captain_User'));
  END IF;
END $$;

-- Disease mapping: normalized disease_cases table for map dashboards
CREATE TABLE IF NOT EXISTS public.disease_cases (
  case_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_type text NOT NULL,
  barangay text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  date_reported date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Reported',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.disease_cases ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disease_cases' AND policyname='Auth read disease_cases'
  ) THEN
    CREATE POLICY "Auth read disease_cases" ON public.disease_cases
    FOR SELECT TO authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disease_cases' AND policyname='Staff insert disease_cases'
  ) THEN
    CREATE POLICY "Staff insert disease_cases" ON public.disease_cases
    FOR INSERT TO authenticated
    WITH CHECK (
      public.has_role(auth.uid(), 'BHW_User')
      OR public.has_role(auth.uid(), 'Clerk_User')
      OR public.has_role(auth.uid(), 'Captain_User')
      OR public.has_role(auth.uid(), 'SysAdmin_User')
    );
  END IF;
END $$;

