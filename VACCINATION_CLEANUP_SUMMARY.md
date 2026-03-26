# Vaccination Table Cleanup - Summary of Changes

## Date: March 25, 2026
## Objective: Remove duplicate "child_name" column and unused "patient_type" from vaccinations table

---

## 📋 Database Changes

### SQL Migration Created:
**File:** `supabase/migrations/20260325000100_drop_vaccinations_child_name_column.sql`

**Actions:**
1. ✅ DROP COLUMN `child_name` (redundant - duplicate of `patient_name`)
2. ✅ DROP COLUMN `patient_type` (unused - all NULL values)

**Columns Retained in vaccinations table:**
- `id` - Primary key
- `patient_name` - Primary identifier (replacing child_name)
- `age` - Patient age
- `vaccine` - Vaccine type
- `vaccination_date` - Actual vaccination date
- `status` - Record status
- `bhw_name` - BHW who recorded it
- `recorded_by` - User ID reference
- `created_at` - Timestamp
- `user_id` - Links to citizen (for requests)
- `preferred_date` - Requested date (from citizen)
- `health_center` - Preferred health center (from citizen)
- `notes` - Additional notes

---

## 🔄 Code Updates

### 1. Backend Functions
**File:** `netlify/functions/submit-vaccination.js`
- Changed parameter: `child_name` → `patient_name`
- Updated validation message to reference `patient_name`
- Updated insert query to use `patient_name`

### 2. Frontend Components

#### Citizen Pages
**File:** `src/pages/citizen/VaccinationNutrition.tsx`
- Form state: `child_name` → `patient_name`
- Form input label: "Child Name" → "Patient Name"
- Placeholder: "Enter child's name" → "Enter patient's name"
- API call payload updated to send `patient_name`
- Form reset uses `patient_name`
- Disabled button check uses `patient_name`
- Detail modal display: `child_name` → `patient_name`
- Table display: `child_name` → `patient_name`

**File:** `src/pages/citizen/ServiceRequests.tsx`
- Vaccination normalization: `vac.child_name` → `vac.patient_name`
- Description text: "Child:" → "Patient:"
- Health center field: `vac.health_center_preferred` → `vac.health_center`
- Detail modal label: "Child Name" → "Patient Name"
- Detail modal display: `child_name` → `patient_name`

#### Staff Pages
**File:** `src/pages/staff/StaffScanQr.tsx`
- Vaccination display: `v.child_name` → `v.patient_name`

#### BHW Pages
**File:** `src/pages/bhw/HealthPrograms.tsx`
- Vaccination table display: `v.child_name` → `v.patient_name`

---

## ✅ What Was NOT Changed

### Nutrition Records (Intentionally Kept)
- `child_name` column remains in `nutrition_records` table
- All references to `nutrition_records.child_name` remain unchanged
- Files affected (nutrition-specific):
  - `src/pages/bhw/NutritionMonitoring.tsx` - Still uses `n.child_name`
  - `src/pages/ImmunizationTracker.tsx` - Still uses `n.child_name`
  - `src/integrations/supabase/types.ts` - `nutrition_records` type unchanged
  - `src/hooks/useRealtimeNotifications.ts` - Uses nutrition `child_name`

**Reason:** Nutrition records table structure wasn't part of this cleanup

---

## 📊 Impact Analysis

### Before Changes
- Vaccinations table had 15 columns
- Redundant data: `child_name` and `patient_name` both stored same value
- Unused column: `patient_type`

### After Changes
- Vaccinations table has 13 columns
- Single source of truth: `patient_name`
- Cleaner schema without unused columns
- No data loss (unused columns contained only NULLs)

---

## 🧪 Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Verify `child_name` column is removed
- [ ] Verify `patient_type` column is removed
- [ ] Test citizen vaccination form submission with new `patient_name` field
- [ ] Verify vaccination records display correctly in citizen dashboard
- [ ] Verify vaccination records display correctly in BHW views
- [ ] Verify staff QR scan shows vaccination data properly
- [ ] Verify service requests vaccination details show patient_name
- [ ] Verify nutrition records still work (child_name intact)

---

## 🔗 Related Files Summary

**Modified Files (8 total):**
1. `netlify/functions/submit-vaccination.js` - Backend API
2. `src/pages/citizen/VaccinationNutrition.tsx` - Citizen form + display
3. `src/pages/citizen/ServiceRequests.tsx` - Service request view
4. `src/pages/staff/StaffScanQr.tsx` - Staff view
5. `src/pages/bhw/HealthPrograms.tsx` - BHW view
6. `supabase/migrations/20260325000100_drop_vaccinations_child_name_column.sql` - Migration

**Unchanged Files (Supporting context):**
- Nutrition-related components (intentional)
- TypeScript types (define the schema)
