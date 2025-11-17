-- Add intervals column to attendance table
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS intervals JSONB DEFAULT '[]'::jsonb;

-- Migrate existing check_in/check_out data to intervals format
UPDATE public.attendance
SET intervals = 
  CASE 
    WHEN check_in IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object(
          'check_in', check_in,
          'check_out', check_out
        )
      )
    ELSE '[]'::jsonb
  END
WHERE intervals IS NULL OR intervals = '[]'::jsonb;