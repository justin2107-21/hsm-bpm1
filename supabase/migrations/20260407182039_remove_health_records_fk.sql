-- Drop the FK constraint on resident_health_records to allow flexible user_id values
ALTER TABLE public.resident_health_records 
DROP CONSTRAINT resident_health_records_user_id_fkey;
