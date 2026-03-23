-- Add missing columns to vaccinations table to support citizen submission
ALTER TABLE "public"."vaccinations" 
ADD COLUMN "user_id" UUID REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
ADD COLUMN "preferred_date" DATE,
ADD COLUMN "health_center" TEXT,
ADD COLUMN "notes" TEXT;

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_vaccinations_user_id ON "public"."vaccinations"("user_id");
