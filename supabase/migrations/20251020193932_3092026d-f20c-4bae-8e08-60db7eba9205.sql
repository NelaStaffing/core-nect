-- Step 1: Drop storage policies that depend on has_role
DROP POLICY IF EXISTS "Company admins can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can update resources" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can delete resources" ON storage.objects;

-- Step 2: Drop all other dependent policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Company admins can manage surveys" ON public.surveys;
DROP POLICY IF EXISTS "Company admins can manage questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Company admins can view all responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Company admins can manage metrics" ON public.company_metrics;
DROP POLICY IF EXISTS "Company admins can view all requests" ON public.employee_requests;
DROP POLICY IF EXISTS "Company admins can update requests" ON public.employee_requests;
DROP POLICY IF EXISTS "Company admins can manage achievements" ON public.achievements;
DROP POLICY IF EXISTS "Company admins can view all user achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Company admins can manage rewards" ON public.rewards;
DROP POLICY IF EXISTS "Company admins can view all redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Company admins can update redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Company admins can manage resources" ON public.company_resources;
DROP POLICY IF EXISTS "Managers can view their own surveys" ON public.employee_kpi_surveys;
DROP POLICY IF EXISTS "Managers can create surveys" ON public.employee_kpi_surveys;
DROP POLICY IF EXISTS "Company admins can manage KPI questions" ON public.kpi_questions;

-- Step 3: Drop the functions
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_roles(uuid) CASCADE;

-- Step 4: Rename and create new enum
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('employee', 'manager', 'company', 'admin');

-- Step 5: Update user_roles table
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

-- Step 6: Drop old enum
DROP TYPE public.app_role_old;

-- Step 7: Recreate the security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS SETOF app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- Step 8: Recreate all RLS policies with new role structure
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can manage surveys"
ON public.surveys FOR ALL TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can manage questions"
ON public.survey_questions FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM surveys WHERE surveys.id = survey_questions.survey_id
  AND (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
));

CREATE POLICY "Manager, company and admin can view all responses"
ON public.survey_responses FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can create notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can view metrics"
ON public.company_metrics FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company and admin can manage metrics"
ON public.company_metrics FOR ALL TO authenticated
USING (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can view all requests"
ON public.employee_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can update requests"
ON public.employee_requests FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company and admin can manage achievements"
ON public.achievements FOR ALL TO authenticated
USING (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can view all user achievements"
ON public.user_achievements FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company and admin can manage rewards"
ON public.rewards FOR ALL TO authenticated
USING (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can view all redemptions"
ON public.reward_redemptions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can update redemptions"
ON public.reward_redemptions FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can manage resources"
ON public.company_resources FOR ALL TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can view surveys"
ON public.employee_kpi_surveys FOR SELECT TO authenticated
USING (auth.uid() = manager_id OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager, company and admin can create surveys"
ON public.employee_kpi_surveys FOR INSERT TO authenticated
WITH CHECK ((auth.uid() = manager_id) AND (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Company and admin can manage KPI questions"
ON public.kpi_questions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR (company_id = auth.uid()));

-- Recreate storage policies
CREATE POLICY "Manager, company and admin can upload resources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-resources' AND (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Manager, company and admin can update resources"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'company-resources' AND (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Manager, company and admin can delete resources"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'company-resources' AND (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'company'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));