-- Fix search path for get_current_quarter_week function
CREATE OR REPLACE FUNCTION public.get_current_quarter_week()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  week_of_year integer;
  quarter_start_week integer;
  week_in_quarter integer;
BEGIN
  week_of_year := EXTRACT(WEEK FROM CURRENT_DATE);
  
  -- Calculate which week of the quarter we're in (1-13)
  quarter_start_week := CASE 
    WHEN EXTRACT(QUARTER FROM CURRENT_DATE) = 1 THEN 1
    WHEN EXTRACT(QUARTER FROM CURRENT_DATE) = 2 THEN 14
    WHEN EXTRACT(QUARTER FROM CURRENT_DATE) = 3 THEN 27
    ELSE 40
  END;
  
  week_in_quarter := week_of_year - quarter_start_week + 1;
  
  -- Ensure it's between 1 and 13
  IF week_in_quarter < 1 THEN week_in_quarter := 1; END IF;
  IF week_in_quarter > 13 THEN week_in_quarter := 13; END IF;
  
  RETURN week_in_quarter;
END;
$$;