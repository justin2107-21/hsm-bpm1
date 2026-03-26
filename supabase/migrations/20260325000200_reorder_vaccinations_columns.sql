-- Reorder vaccinations table columns
-- Move patient_name and user_id to come after id column
-- This improves schema organization for tracking: who (user_id) and what (patient_name)

-- Create temporary table with new column order
CREATE TABLE vaccinations_new AS
SELECT 
  id,
  patient_name,
  user_id,
  age,
  vaccine,
  vaccination_date,
  status,
  bhw_name,
  recorded_by,
  created_at,
  preferred_date,
  health_center,
  notes
FROM vaccinations;

-- Drop old table
DROP TABLE vaccinations;

-- Rename new table
ALTER TABLE vaccinations_new RENAME TO vaccinations;

-- Recreate primary key
ALTER TABLE vaccinations ADD PRIMARY KEY (id);

-- Clean up orphaned recorded_by references before restoring constraint
UPDATE vaccinations 
SET recorded_by = NULL 
WHERE recorded_by IS NOT NULL 
  AND recorded_by NOT IN (SELECT id FROM auth.users);

-- Clean up orphaned user_id references before restoring constraint
UPDATE vaccinations 
SET user_id = NULL 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM auth.users);

-- Recreate foreign keys
ALTER TABLE vaccinations ADD CONSTRAINT vaccinations_recorded_by_fkey 
  FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE vaccinations ADD CONSTRAINT vaccinations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Authenticated users can read vaccinations" 
  ON vaccinations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert vaccinations" 
  ON vaccinations FOR INSERT TO authenticated WITH CHECK (true);
