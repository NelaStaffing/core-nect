-- Add fields to kpi_questions for quarterly tracking
ALTER TABLE public.kpi_questions
ADD COLUMN IF NOT EXISTS week_number integer,
ADD COLUMN IF NOT EXISTS quarter text,
ADD COLUMN IF NOT EXISTS year integer,
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kpi_questions_company_quarter 
ON public.kpi_questions(company_id, year, quarter, week_number);

-- Function to initialize 13 default KPI questions for a company
CREATE OR REPLACE FUNCTION public.initialize_default_kpi_questions(_company_id uuid, _year integer, _quarter text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_questions text[] := ARRAY[
    'How would you rate your overall productivity this week?',
    'How satisfied are you with team collaboration?',
    'Rate your work-life balance this week',
    'How clear were your goals and priorities?',
    'How satisfied are you with available resources?',
    'Rate the quality of communication in your team',
    'How manageable was your workload this week?',
    'How satisfied are you with feedback received?',
    'Rate your level of engagement with current projects',
    'How well did you manage stress this week?',
    'How satisfied are you with professional development opportunities?',
    'Rate the effectiveness of team meetings',
    'How aligned do you feel with company goals?'
  ];
  i integer;
BEGIN
  FOR i IN 1..13 LOOP
    INSERT INTO public.kpi_questions (
      question_text,
      question_type,
      active,
      created_by,
      company_id,
      week_number,
      quarter,
      year
    ) VALUES (
      default_questions[i],
      'scale',
      true,
      _company_id,
      _company_id,
      i,
      _quarter,
      _year
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Function to get current week number in quarter (1-13)
CREATE OR REPLACE FUNCTION public.get_current_quarter_week()
RETURNS integer
LANGUAGE plpgsql
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

-- Update RLS policies to include company_id check
DROP POLICY IF EXISTS "Company admins can manage KPI questions" ON public.kpi_questions;

CREATE POLICY "Company admins can manage KPI questions"
ON public.kpi_questions
FOR ALL
USING (
  has_role(auth.uid(), 'company'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR company_id = auth.uid()
);