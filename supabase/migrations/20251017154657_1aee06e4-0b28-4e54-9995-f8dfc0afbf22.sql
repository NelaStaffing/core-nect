-- Create employee KPI surveys table
CREATE TABLE public.employee_kpi_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  mood_rating INTEGER NOT NULL CHECK (mood_rating BETWEEN 1 AND 3),
  kpi_score INTEGER NOT NULL CHECK (kpi_score BETWEEN 0 AND 5),
  kpi_feedback TEXT,
  week_start_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_kpi_surveys ENABLE ROW LEVEL SECURITY;

-- Policies for employee_kpi_surveys
CREATE POLICY "Managers can view their own surveys"
ON public.employee_kpi_surveys
FOR SELECT
USING (auth.uid() = manager_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can create surveys"
ON public.employee_kpi_surveys
FOR INSERT
WITH CHECK (auth.uid() = manager_id AND (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin')));

-- Create indexes for performance
CREATE INDEX idx_employee_kpi_surveys_manager ON public.employee_kpi_surveys(manager_id);
CREATE INDEX idx_employee_kpi_surveys_employee ON public.employee_kpi_surveys(employee_id);
CREATE INDEX idx_employee_kpi_surveys_week ON public.employee_kpi_surveys(week_start_date);