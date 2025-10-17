-- Create surveys table
CREATE TABLE public.surveys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

-- Create survey_questions table
CREATE TABLE public.survey_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('text', 'rating', 'multiple_choice', 'yes_no')),
  options jsonb,
  required boolean DEFAULT true,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create survey_responses table
CREATE TABLE public.survey_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  response_text text,
  response_value integer,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(survey_id, user_id, question_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create company_metrics table
CREATE TABLE public.company_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surveys
CREATE POLICY "Company admins can manage surveys"
ON public.surveys FOR ALL
USING (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view active surveys"
ON public.surveys FOR SELECT
USING (status = 'active');

-- RLS Policies for survey_questions
CREATE POLICY "Company admins can manage questions"
ON public.survey_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.surveys
    WHERE surveys.id = survey_questions.survey_id
    AND (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Employees can view questions for active surveys"
ON public.survey_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.surveys
    WHERE surveys.id = survey_questions.survey_id
    AND surveys.status = 'active'
  )
);

-- RLS Policies for survey_responses
CREATE POLICY "Users can submit their own responses"
ON public.survey_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses"
ON public.survey_responses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Company admins can view all responses"
ON public.survey_responses FOR SELECT
USING (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for company_metrics
CREATE POLICY "Company admins can manage metrics"
ON public.company_metrics FOR ALL
USING (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_surveys_updated_at
BEFORE UPDATE ON public.surveys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();