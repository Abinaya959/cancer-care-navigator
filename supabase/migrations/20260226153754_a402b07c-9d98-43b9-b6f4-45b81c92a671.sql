
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'health_worker', 'public_user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read user_roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert user_roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (true);

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT,
  role TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  action_type TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read audit_logs"
  ON public.audit_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert audit_logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Validation trigger for action_type
CREATE OR REPLACE FUNCTION public.validate_action_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.action_type NOT IN ('create', 'update', 'delete') THEN
    RAISE EXCEPTION 'Invalid action_type: %', NEW.action_type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_audit_action_type
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_action_type();
