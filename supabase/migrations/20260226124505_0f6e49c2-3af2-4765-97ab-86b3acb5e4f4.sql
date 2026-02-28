
-- Create cancer_records table
CREATE TABLE public.cancer_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district TEXT NOT NULL,
  csfi_score NUMERIC NOT NULL DEFAULT 0,
  avg_diagnostic_delay NUMERIC NOT NULL DEFAULT 0,
  dropout_rate NUMERIC NOT NULL DEFAULT 0,
  stage_iv_percentage NUMERIC NOT NULL DEFAULT 0,
  population INTEGER NOT NULL DEFAULT 0,
  screening_coverage NUMERIC NOT NULL DEFAULT 0,
  referral_delay NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cancer_records ENABLE ROW LEVEL SECURITY;

-- Public read access (this is public health data, not PII)
CREATE POLICY "Anyone can read cancer_records"
  ON public.cancer_records FOR SELECT
  USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert cancer_records"
  ON public.cancer_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update cancer_records"
  ON public.cancer_records FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete cancer_records"
  ON public.cancer_records FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cancer_records_updated_at
  BEFORE UPDATE ON public.cancer_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
