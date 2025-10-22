-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  settings JSONB,
  active BOOLEAN DEFAULT true
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create employee_companies junction table
CREATE TABLE public.employee_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('contractor', 'full time', 'part time')),
  date_started DATE NOT NULL,
  job_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, company_id)
);

-- Enable RLS on employee_companies
ALTER TABLE public.employee_companies ENABLE ROW LEVEL SECURITY;

-- Create manager_employees junction table
CREATE TABLE public.manager_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(manager_id, employee_id, company_id)
);

-- Enable RLS on manager_employees
ALTER TABLE public.manager_employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Admins can manage all companies"
ON public.companies
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company role can view and manage their company"
ON public.companies
FOR ALL
USING (has_role(auth.uid(), 'company'::app_role));

CREATE POLICY "Employees can view their assigned companies"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employee_companies
    WHERE employee_companies.company_id = companies.id
    AND employee_companies.employee_id = auth.uid()
  )
);

CREATE POLICY "Managers can view their assigned companies"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.manager_employees
    WHERE manager_employees.company_id = companies.id
    AND manager_employees.manager_id = auth.uid()
  )
);

-- RLS Policies for employee_companies
CREATE POLICY "Admins can manage all employee-company assignments"
ON public.employee_companies
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company role can manage employee assignments"
ON public.employee_companies
FOR ALL
USING (has_role(auth.uid(), 'company'::app_role));

CREATE POLICY "Managers can view their employees' assignments"
ON public.employee_companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.manager_employees
    WHERE manager_employees.employee_id = employee_companies.employee_id
    AND manager_employees.manager_id = auth.uid()
  )
);

CREATE POLICY "Employees can view their own assignments"
ON public.employee_companies
FOR SELECT
USING (auth.uid() = employee_id);

-- RLS Policies for manager_employees
CREATE POLICY "Admins can manage all manager-employee relationships"
ON public.manager_employees
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company role can manage manager-employee relationships"
ON public.manager_employees
FOR ALL
USING (has_role(auth.uid(), 'company'::app_role));

CREATE POLICY "Managers can view their own assignments"
ON public.manager_employees
FOR SELECT
USING (auth.uid() = manager_id);

CREATE POLICY "Employees can view who manages them"
ON public.manager_employees
FOR SELECT
USING (auth.uid() = employee_id);

-- Create updated_at triggers
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_companies_updated_at
BEFORE UPDATE ON public.employee_companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_employee_companies_employee ON public.employee_companies(employee_id);
CREATE INDEX idx_employee_companies_company ON public.employee_companies(company_id);
CREATE INDEX idx_manager_employees_manager ON public.manager_employees(manager_id);
CREATE INDEX idx_manager_employees_employee ON public.manager_employees(employee_id);
CREATE INDEX idx_manager_employees_company ON public.manager_employees(company_id);