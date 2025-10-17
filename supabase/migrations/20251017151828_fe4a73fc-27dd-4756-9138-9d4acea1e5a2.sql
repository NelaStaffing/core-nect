-- Create storage bucket for company resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-resources', 'company-resources', false);

-- Create table for tracking uploaded resources
CREATE TABLE public.company_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_resources table
CREATE POLICY "Company admins can manage resources"
ON public.company_resources
FOR ALL
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view resources"
ON public.company_resources
FOR SELECT
USING (true);

-- Storage policies for company-resources bucket
CREATE POLICY "Company admins can upload resources"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'company-resources' AND
  (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Company admins can update resources"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'company-resources' AND
  (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Company admins can delete resources"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'company-resources' AND
  (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Everyone can view resources"
ON storage.objects
FOR SELECT
USING (bucket_id = 'company-resources');

-- Update trigger
CREATE TRIGGER update_company_resources_updated_at
BEFORE UPDATE ON public.company_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();