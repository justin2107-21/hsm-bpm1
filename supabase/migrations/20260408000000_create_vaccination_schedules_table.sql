-- Create vaccination_schedules table for available schedules
CREATE TABLE public.vaccination_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaccine TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  schedule_time TIME,
  barangay TEXT,
  health_center_location TEXT,
  assigned_bhw TEXT,
  capacity INT DEFAULT 50,
  registered INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vaccination_schedules ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read schedules
CREATE POLICY "Authenticated users can read vaccination schedules" 
  ON public.vaccination_schedules FOR SELECT TO authenticated USING (true);

-- Insert sample vaccination schedules
INSERT INTO public.vaccination_schedules (vaccine, schedule_date, schedule_time, barangay, health_center_location, assigned_bhw, capacity, registered)
VALUES 
  ('COVID-19', '2026-04-15', '08:00:00', 'Commonwealth', 'Commonwealth Health Center', 'BHW Maria Santos', 50, 0),
  ('Measles', '2026-04-16', '09:00:00', 'Fairview', 'Fairview Clinic', 'BHW Juan Cruz', 40, 0),
  ('DPT', '2026-04-17', '10:00:00', 'Batasan Hills', 'Batasan Health Center', 'BHW Rosa Garcia', 35, 0),
  ('Polio', '2026-04-18', '08:30:00', 'Bagong Silangan', 'Bagong Silangan Medical Clinic', 'BHW Pedro Lopez', 45, 0),
  ('BCG', '2026-04-19', '09:30:00', 'Bungad', 'Bungad Health Station', 'BHW Ana Martinez', 50, 0),
  ('Hepatitis B', '2026-04-20', '11:00:00', 'Sta. Monica', 'Sta. Monica Clinic', 'BHW Luis Fernandez', 40, 0),
  ('Yellow Fever', '2026-04-21', '08:00:00', 'Sta. Lucia', 'Sta. Lucia Health Center', 'BHW Carmen Reyes', 30, 0),
  ('Tetanus', '2026-04-22', '10:00:00', 'Apollo', 'Apollo Medical Clinic', 'BHW Miguel Santos', 35, 0),
  ('Influenza', '2026-04-23', '09:00:00', 'Holy Spirit', 'Holy Spirit Health Station', 'BHW Isabel Rivera', 45, 0),
  ('Pneumococcal', '2026-04-24', '08:30:00', 'Commonwealth', 'Commonwealth Health Center', 'BHW Maria Santos', 50, 0),
  ('HPV', '2026-04-25', '10:30:00', 'Fairview', 'Fairview Clinic', 'BHW Juan Cruz', 25, 0),
  ('Varicella', '2026-04-26', '11:00:00', 'Batasan Hills', 'Batasan Health Center', 'BHW Rosa Garcia', 40, 0);
