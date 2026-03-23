-- Add scheduled_date and scheduled_time columns to service_requests table
-- This allows citizens to schedule appointments for health services

ALTER TABLE service_requests
ADD COLUMN scheduled_date DATE,
ADD COLUMN scheduled_time TIME;

-- Add comment to document the purpose of these columns
COMMENT ON COLUMN service_requests.scheduled_date IS 'Optional preferred date for service appointment';
COMMENT ON COLUMN service_requests.scheduled_time IS 'Optional preferred time for service appointment';