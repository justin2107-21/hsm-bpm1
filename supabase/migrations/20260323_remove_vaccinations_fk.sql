-- Remove foreign key constraint from vaccinations.user_id
-- This allows citizen submissions to work independently of profiles table
ALTER TABLE "public"."vaccinations" 
DROP CONSTRAINT IF EXISTS "vaccinations_user_id_fkey";
