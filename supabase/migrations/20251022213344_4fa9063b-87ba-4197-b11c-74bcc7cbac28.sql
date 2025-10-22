-- 1) Ensure signup trigger is set up to create profile + default role
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Secure function to assign roles with bootstrap logic
CREATE OR REPLACE FUNCTION public.admin_assign_role(_target_user uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  admin_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO admin_exists;

  -- Bootstrap: if no admin exists yet, allow caller to self-assign admin once
  IF NOT admin_exists THEN
    IF _role = 'admin' AND _target_user = caller THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (_target_user, _role)
      ON CONFLICT DO NOTHING;
      RETURN true;
    ELSE
      RAISE EXCEPTION 'No admin exists yet. The first admin must assign admin to themselves.' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Require admin for all subsequent role assignments
  IF NOT public.has_role(caller, 'admin') THEN
    RAISE EXCEPTION 'Not authorized to assign roles' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user, _role)
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_assign_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_assign_role(uuid, app_role) TO authenticated;

-- 3) Secure function to create company for a user
CREATE OR REPLACE FUNCTION public.create_company_for_user(_user_id uuid, _company_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  new_company_id uuid;
BEGIN
  -- Require admin or company role of caller
  IF NOT (public.has_role(caller, 'admin') OR public.has_role(caller, 'company')) THEN
    RAISE EXCEPTION 'Not authorized to create companies' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.companies (id, name)
  VALUES (_user_id, _company_name)
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO new_company_id;

  RETURN COALESCE(new_company_id, _user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.create_company_for_user(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_company_for_user(uuid, text) TO authenticated;

-- 4) Secure function to assign employee/manager to company
CREATE OR REPLACE FUNCTION public.assign_employee_to_company(
  _employee_id uuid,
  _company_id uuid,
  _job_title text,
  _contract_type text,
  _date_started date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  new_id uuid;
BEGIN
  -- Only admin or company role can assign
  IF NOT (public.has_role(caller, 'admin') OR public.has_role(caller, 'company')) THEN
    RAISE EXCEPTION 'Not authorized to assign employees' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.employee_companies (employee_id, company_id, job_title, contract_type, date_started)
  VALUES (_employee_id, _company_id, _job_title, _contract_type, _date_started)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_employee_to_company(uuid, uuid, text, text, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_employee_to_company(uuid, uuid, text, text, date) TO authenticated;