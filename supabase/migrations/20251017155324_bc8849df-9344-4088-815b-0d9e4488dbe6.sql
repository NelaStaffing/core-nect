-- Create KPI questions table
CREATE TABLE public.kpi_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'scale', -- scale, yesno, rating
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.kpi_questions ENABLE ROW LEVEL SECURITY;

-- Policies for kpi_questions
CREATE POLICY "Company admins can manage KPI questions"
ON public.kpi_questions
FOR ALL
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active KPI questions"
ON public.kpi_questions
FOR SELECT
USING (active = true);

-- Insert some default KPI questions
INSERT INTO public.kpi_questions (question_text, question_type) VALUES
  ('How satisfied are you with this employee''s communication skills?', 'scale'),
  ('Rate this employee''s problem-solving abilities', 'scale'),
  ('How well does this employee collaborate with the team?', 'scale'),
  ('Does this employee consistently meet deadlines?', 'yesno'),
  ('Rate this employee''s adaptability to change', 'rating'),
  ('How would you rate this employee''s technical skills?', 'scale'),
  ('Is this employee proactive in taking on new challenges?', 'yesno'),
  ('Rate this employee''s leadership potential', 'rating');

-- Add question reference to employee_kpi_surveys
ALTER TABLE public.employee_kpi_surveys
ADD COLUMN kpi_question_id UUID REFERENCES public.kpi_questions(id),
ADD COLUMN kpi_question_text TEXT;

-- Create index
CREATE INDEX idx_kpi_questions_active ON public.kpi_questions(active);