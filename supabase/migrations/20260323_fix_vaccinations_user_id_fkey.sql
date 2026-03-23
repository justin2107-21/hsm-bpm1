-- Fix foreign key constraint on vaccinations.user_id
-- Make user_id nullable so citizen submissions don't require a profile record
ALTER TABLE "public"."vaccinations" 
DROP CONSTRAINT IF EXISTS "vaccinations_user_id_fkey";

ALTER TABLE "public"."vaccinations" 
ALTER COLUMN "user_id" DROP NOT NULL;

-- Recreate the foreign key as optional (nullable)
ALTER TABLE "public"."vaccinations" 
ADD CONSTRAINT "vaccinations_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
