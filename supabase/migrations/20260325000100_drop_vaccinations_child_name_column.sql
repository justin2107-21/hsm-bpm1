-- Clean up vaccinations table: remove duplicate and unused columns
-- Keep patient_name as the primary identifier

-- Remove duplicate child_name column (replaced by patient_name)
ALTER TABLE vaccinations
DROP COLUMN IF EXISTS child_name;

-- Remove unused patient_type column (all nulls, not in use)
ALTER TABLE vaccinations
DROP COLUMN IF EXISTS patient_type;
