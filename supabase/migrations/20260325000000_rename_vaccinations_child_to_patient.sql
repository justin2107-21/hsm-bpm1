-- Rename child_name to patient_name in vaccinations table
ALTER TABLE vaccinations
RENAME COLUMN child_name TO patient_name;
