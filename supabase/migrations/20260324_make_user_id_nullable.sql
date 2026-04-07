-- Disable RLS and make user_id nullable for resident_permits (academic project simplification)

-- Step 1: Disable RLS
ALTER TABLE public.resident_permits DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop the FK constraint  
ALTER TABLE public.resident_permits 
DROP CONSTRAINT resident_permits_user_id_fkey;

-- Step 3: Make user_id nullable
ALTER TABLE public.resident_permits 
ALTER COLUMN user_id DROP NOT NULL;
